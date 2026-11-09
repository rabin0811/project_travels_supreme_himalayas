'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin';
import { slugify } from '@/lib/slugify';
import { htmlToText, textToHtml } from '@/lib/blogText';
import MediaPicker from '@/components/admin/MediaPicker';

const TOOLS = [
  { label: 'H2', hint: 'Heading', insert: '## ', block: true, title: 'Heading 2' },
  { label: 'H3', hint: 'Sub-heading', insert: '### ', block: true, title: 'Heading 3' },
  { label: 'B', hint: 'Bold', wrap: '**', title: 'Bold' },
  { label: 'I', hint: 'Italic', wrap: '*', title: 'Italic' },
  { label: '\u2022', hint: 'Bullet list', insert: '- ', block: true, title: 'Bullet point (starts a line)' },
  { label: '\u2630', hint: 'Quote', insert: '> ', block: true, title: 'Quote' },
  { label: '\u00B6', hint: 'Blank line', insert: '\n\n', block: true, title: 'Blank line (new paragraph)' },
];

const LINK_MD = '[link text](https://example.com)';

export default function BlogForm({ initial }) {
  const router = useRouter();
  const textarea = useRef(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    featured_image: '',
    published_at: new Date().toISOString().slice(0, 10),
    heading_color: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial)
      setForm({
        ...initial,
        content: htmlToText(initial.content),
        published_at: (initial.published_at || '').slice(0, 10),
        heading_color: initial.heading_color || '',
      });
  }, [initial]);

  const apply = (op) => {
    const el = textarea.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e);
    let next;
    if (op.wrap) {
      next = value.slice(0, s) + op.wrap + (sel || 'text') + op.wrap + value.slice(e);
    } else {
      const prefix = (s === 0 || value.slice(s - 2).endsWith('\n')) ? '' : '\n';
      next = value.slice(0, s) + prefix + op.insert + (sel || '') + value.slice(e);
    }
    setForm({ ...form, content: next });
    requestAnimationFrame(() => {
      el.focus();
      const pos = (op.wrap ? s + op.wrap.length : s + (op.insert.startsWith('\n') ? 1 : 0) + op.insert.length);
      el.setSelectionRange(pos, op.wrap ? e + op.wrap.length : pos);
    });
  };

  const applyLink = () => {
    const el = textarea.current;
    if (!el) return;
    const { selectionStart: s, value } = el;
    const next = value.slice(0, s) + LINK_MD + value.slice(s);
    setForm({ ...form, content: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + 1, s + 1 + 'link text'.length);
    });
  };

  const colorOk = (c) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test((c || '').trim());

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const hc = form.heading_color.trim();
    if (hc && !colorOk(hc)) {
      setError('Heading color must be an HTML hex value like #c0392b');
      setSaving(false);
      return;
    }
    const payload = {
      ...form,
      heading_color: hc || null,
      content: textToHtml(form.content),
      slug: slugify(form.slug) || undefined,
      published_at: form.published_at ? new Date(`${form.published_at}T10:00:00`) : null,
    };
    try {
      initial
        ? await adminFetch(`/api/blog-posts/${initial.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await adminFetch('/api/blog-posts', { method: 'POST', body: JSON.stringify(payload) });
      router.push('/admin/blog');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-card__head"><h2>{initial ? 'Edit Post' : 'New Blog Post'}</h2></div>
        <div className="admin-card__body">
          <div className="form-row">
            <div className="field">
              <label>Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug ? form.slug : slugify(e.target.value) })} />
            </div>
            <div className="field">
              <label>Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Publish date</label>
              <input type="date" value={form.published_at || ''} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
            </div>
            <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ marginRight: 8 }}>Featured image</label>
              <MediaPicker value={form.featured_image ? [form.featured_image] : []} onChange={(v) => setForm({ ...form, featured_image: v[0] || '' })} multiple={false} />
            </div>
          </div>

          <div className="editor-grid">
            <div>
              <div className="ed-toolbar">
                {TOOLS.map((t) => (
                  <button key={t.label} type="button" className="ed-tool" title={t.title} onClick={() => apply(t)}>
                    {t.label}
                  </button>
                ))}
                <button type="button" className="ed-tool" title="Link — only links keep the site link color" onClick={applyLink}>
                  {'\u{1F517}'}
                </button>
              </div>
              <textarea
                ref={textarea}
                rows={16}
                placeholder={'Start typing... \n\n## Heading\nYour paragraph text here.\n\n- bullet point'}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <aside className="ed-side">
              <div className="ed-card">
                <h4>Heading color</h4>
                <p className="ed-note">Headings on the article page use this color. Links and all other text keep the site colors.</p>
                <div className="ed-color-row">
                  <input
                    type="color"
                    aria-label="Heading color"
                    value={colorOk(form.heading_color) ? form.heading_color : '#c0392b'}
                    onChange={(e) => setForm({ ...form, heading_color: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="#c0392b"
                    value={form.heading_color}
                    onChange={(e) => setForm({ ...form, heading_color: e.target.value })}
                  />
                </div>
                <div className="ed-swatches">
                  {['#c0392b', '#1a56db', '#2e7d32', '#b5651d', '#7d3c98', '#0f766e', '#8a6420', '#334155'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Use ${c}`}
                      className={`ed-swatch ${form.heading_color === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setForm({ ...form, heading_color: c })}
                    />
                  ))}
                </div>
                <button type="button" className="admin-btn" style={{ marginTop: 8 }} onClick={() => setForm({ ...form, heading_color: '' })}>
                  Reset to site default
                </button>
              </div>

              <div className="ed-card">
                <h4>Formatting guide</h4>
                <p className="ed-note">Click a tool above, or type these markers:</p>
                <ul className="ed-guide">
                  <li><code>## Heading</code> = big heading (colored)</li>
                  <li><code>### Subheading</code> = smaller heading (colored)</li>
                  <li><code>**bold**</code> / <code>*italic*</code></li>
                  <li><code>- item</code> = bullet list</li>
                  <li><code>[text](url)</code> = link — the link color is always the site blue</li>
                  <li><code>&gt; text</code> = quote</li>
                  <li>blank line = new paragraph</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
      {error && <p style={{ color: 'var(--flag-red)', marginBottom: 14 }}>{error}</p>}
      {!colorOk(form.heading_color) && form.heading_color && (
        <p style={{ color: 'var(--flag-red)', marginBottom: 14 }}>Heading color must be a hex value like #c0392b.</p>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="admin-btn admin-btn--primary" style={{ padding: '10px 26px' }} disabled={saving} type="submit">
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Publish Post'}
        </button>
        <a className="admin-btn" href="/admin/blog" style={{ padding: '10px 26px', textDecoration: 'none' }}>Cancel</a>
      </div>
    </form>
  );
}