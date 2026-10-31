import MarkdownIt, { type Env } from 'markdown-it';
import DOMPurify from 'dompurify';
import { classHighlighter, highlightCode } from '@lezer/highlight';
import { parser as javascript } from '@lezer/javascript';
import { parser as css } from '@lezer/css';
import { parser as html } from '@lezer/html';

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
  `<span class="blocked-image">Obrázek: ${markdown.utils.escapeHtml(tokens[index].content || 'bez popisu')} (nenačten)</span>`;

for (const type of ['th_open', 'td_open']) {
  markdown.renderer.rules[type] = (tokens, index, options, _env, renderer) => {
    const token = tokens[index];
    const style = token.attrGet('style');
    const align = typeof style === 'string' ? style.replace('text-align:', '') : undefined;
    if (align === 'left' || align === 'center' || align === 'right') token.attrSet('class', `align-${align}`);
    return renderer.renderToken(tokens, index, options);
  };
}

export function renderMarkdown(source: string): DocumentFragment {
  const context: RenderContext = { highlightRemaining: MAX_HIGHLIGHT_CHARS };
  const fragment = DOMPurify.sanitize(markdown.render(source, context), {
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
    checkbox.setAttribute('aria-label', label || 'Úkol');
    text.prepend(checkbox, ' ');
  }
  for (const block of fragment.querySelectorAll<HTMLElement>('pre, table')) block.tabIndex = 0;
  return fragment;
}
