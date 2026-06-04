import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders headings and inline formatting', () => {
    const html = renderMarkdown('# Title\n\nSome **bold** text.');
    expect(html).toContain('<h1');
    expect(html).toContain('Title');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('highlights fenced code blocks with highlight.js classes', () => {
    const html = renderMarkdown('```python\nprint("hi")\n```');
    expect(html).toContain('hljs');
    expect(html).toContain('language-python');
    // highlight.js envolve tokens em spans com classes hljs-*
    expect(html).toContain('hljs-');
  });

  it('falls back to plaintext for unknown languages without throwing', () => {
    const html = renderMarkdown('```not-a-real-lang\njust text\n```');
    expect(html).toContain('hljs');
    expect(html).toContain('just text');
  });

  it('renders lists', () => {
    const html = renderMarkdown('- one\n- two\n');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>one</li>');
  });
});
