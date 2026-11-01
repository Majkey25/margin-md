import MarkdownIt, { type Env } from 'markdown-it';
import DOMPurify from 'dompurify';
import { classHighlighter, highlightCode } from '@lezer/highlight';
import { parser as javascript } from '@lezer/javascript';
import { parser as css } from '@lezer/css';
import { parser as html } from '@lezer/html';
import { getLocale, t, type Locale } from './i18n';

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
// shortcut: color at most 20,000 characters per render; use a worker for larger highlighted documents.
const MAX_HIGHLIGHT_CHARS = 20_000;
const typescript = javascript.configure({ dialect: 'ts' });
const codeParsers: ReadonlyMap<string, typeof javascript> = new Map([
  ['js', javascript], ['javascript', javascript],
  ['ts', typescript], ['typescript', typescript],
  ['jsx', javascript.configure({ dialect: 'jsx' })],
  ['tsx', javascript.configure({ dialect: 'jsx ts' })],
  ['json', javascript.configure({ top: 'SingleExpression' })],
  ['css', css], ['html', html],
]);

interface RenderContext extends Env { highlightRemaining: number }
// Cache only the displayed document, capped at 32 million HTML characters and released with the page.
const MAX_CACHED_HTML_CHARS = 32 * 1024 * 1024;
let previous: { target: HTMLElement; locale: Locale; blocks: string[] } | undefined;

const plainFence = markdown.renderer.rules.fence!;
markdown.renderer.rules.fence = (tokens, index, options, context, renderer) => {
  const token = tokens[index];
  const language = token.info.trim().split(/\s+/, 1)[0].toLowerCase();
  const parser = codeParsers.get(language);
  if (!parser || !context || typeof context.highlightRemaining !== 'number'
    || token.content.length > context.highlightRemaining) {
    return plainFence(tokens, index, options, context, renderer);
  }
  context.highlightRemaining -= token.content.length;
  let highlighted = '';
  try {
    highlightCode(token.content, parser.parse(token.content), classHighlighter, (text, classes) => {
      const escaped = markdown.utils.escapeHtml(text);
      highlighted += classes ? `<span class="${markdown.utils.escapeHtml(classes)}">${escaped}</span>` : escaped;
    }, () => { highlighted += '\n'; });
  } catch {
    return plainFence(tokens, index, options, context, renderer);
  }
  return plainFence(tokens, index, { ...options, highlight: () => highlighted }, context, renderer);
};

markdown.core.ruler.before('inline', 'task-list', (state) => {
  for (let i = 2; i < state.tokens.length; i++) {
    const token = state.tokens[i];
    if (token.type !== 'inline' || state.tokens[i - 1].type !== 'paragraph_open'
      || state.tokens[i - 2].type !== 'list_item_open') continue;
    const marker = /^\[([ xX])\](?:\s+|$)/.exec(token.content);
    if (!marker) continue;
    token.content = token.content.slice(marker[0].length);
    state.tokens[i - 2].attrJoin('class', marker[1] === ' ' ? 'task-list-item' : 'task-list-item task-list-checked');
  }
});

// Images stay text so opening an untrusted document cannot contact another server.
markdown.renderer.rules.image = (tokens, index) =>
  `<span class="blocked-image">${markdown.utils.escapeHtml(t('Obrázek: {name} (nenačten)', { name: tokens[index].content || t('bez popisu') }))}</span>`;

for (const type of ['th_open', 'td_open']) {
  markdown.renderer.rules[type] = (tokens, index, options, _env, renderer) => {
    const token = tokens[index];
    const style = token.attrGet('style');
    const align = typeof style === 'string' ? style.replace('text-align:', '') : undefined;
    if (align === 'left' || align === 'center' || align === 'right') token.attrSet('class', `align-${align}`);
    return renderer.renderToken(tokens, index, options);
  };
}

export function renderMarkdown(source: string, target: HTMLElement): void {
  const context: RenderContext = { highlightRemaining: MAX_HIGHLIGHT_CHARS };
  const tokens = markdown.parse(source, context);
  const blocks: string[] = [];
  let blockStart = 0;
  let htmlChars = 0;
  for (let index = 0; index < tokens.length; index++) {
    if (tokens[index].level !== 0 || tokens[index].nesting > 0) continue;
    const html = markdown.renderer.render(tokens.slice(blockStart, index + 1), markdown.options, context);
    blocks.push(html);
    htmlChars += html.length;
    blockStart = index + 1;
  }
  const locale = getLocale();
  let first = 0;
  let oldEnd = target.children.length;
  let newEnd = blocks.length;
  if (previous?.target === target && previous.locale === locale && previous.blocks.length === oldEnd) {
    while (first < oldEnd && first < newEnd && previous.blocks[first] === blocks[first]) first++;
    while (oldEnd > first && newEnd > first && previous.blocks[oldEnd - 1] === blocks[newEnd - 1]) { oldEnd--; newEnd--; }
  }
  const fragment = DOMPurify.sanitize(blocks.slice(first, newEnd).join(''), {
    ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 's',
      'a', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'hr', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'class', 'start'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    RETURN_DOM_FRAGMENT: true,
  });
  for (const item of fragment.querySelectorAll('li.task-list-item')) {
    const text = item.firstElementChild?.tagName === 'P' ? item.firstElementChild : item;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.disabled = true;
    checkbox.checked = item.classList.contains('task-list-checked');
    checkbox.className = 'task-list-checkbox';
    const label = Array.from(text.childNodes)
      .filter((node) => !(node instanceof HTMLElement && (node.tagName === 'UL' || node.tagName === 'OL')))
      .map((node) => node.textContent ?? '').join('').trim().slice(0, 240);
    checkbox.setAttribute('aria-label', label || t('Úkol'));
    text.prepend(checkbox, ' ');
  }
  for (const block of fragment.querySelectorAll<HTMLElement>('pre, table')) block.tabIndex = 0;
  if (fragment.children.length !== newEnd - first) throw new Error('Unexpected Markdown block structure.');
  for (const node of Array.from(fragment.childNodes)) if (node.nodeType !== Node.ELEMENT_NODE) node.remove();
  if (oldEnd > first) {
    const range = document.createRange();
    range.setStartBefore(target.children[first]);
    range.setEndAfter(target.children[oldEnd - 1]);
    range.deleteContents();
  }
  target.insertBefore(fragment, target.children[first] ?? null);
  previous = htmlChars <= MAX_CACHED_HTML_CHARS ? { target, locale, blocks } : undefined;
}
