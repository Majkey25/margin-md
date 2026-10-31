import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });

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
  const fragment = DOMPurify.sanitize(markdown.render(source), {
    ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 's',
      'a', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'hr', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'class', 'start'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    RETURN_DOM_FRAGMENT: true,
  });
  for (const block of fragment.querySelectorAll<HTMLElement>('pre, table')) block.tabIndex = 0;
  return fragment;
}
