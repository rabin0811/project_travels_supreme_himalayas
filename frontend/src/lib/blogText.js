export function htmlToText(html) {
  let s = html || '';
  s = s.replace(/<h2[^>]*>/gi, '\n## ');
  s = s.replace(/<h3[^>]*>/gi, '\n### ');
  s = s.replace(/<(p|div)[^>]*>/gi, '\n\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<li[^>]*>/gi, '\n- ');
  s = s.replace(/<\/?(ul|ol|strong|b|em|i|span|blockquote)[^>]*>/gi, '');
  s = s.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/&nbsp;/g, ' ');
  s = s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  s = s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
  return s.replace(/\n{3,}/g, '\n\n').trim();
}

export function textToHtml(text) {
  const inline = (s) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\[([^[\]()]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const out = [];
  let listOpen = false;
  const closeList = () => {
    if (listOpen) { out.push('</ul>'); listOpen = false; }
  };

  for (const raw of (text || '').split('\n')) {
    const t = raw.trim();
    if (!t) { closeList(); continue; }
    const h2 = t.match(/^##\s+(.+)$/);
    const h3 = t.match(/^###\s+(.+)$/);
    if (h2) { closeList(); out.push(`<h2>${inline(h2[1])}</h2>`); continue; }
    if (h3) { closeList(); out.push(`<h3>${inline(h3[1])}</h3>`); continue; }
    if (t.startsWith('- ')) {
      if (!listOpen) { out.push('<ul>'); listOpen = true; }
      out.push(`<li>${inline(t.slice(2))}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(t)}</p>`);
  }
  closeList();
  return out.join('\n');
}

export const BLOG_HINT =
  'Plain text — no HTML needed: blank line starts a new paragraph; start a line with ## for a heading; ' +
  '**bold**, *italic*, [link text](url), and - for bullet points. HTML you paste is kept as plain text.';