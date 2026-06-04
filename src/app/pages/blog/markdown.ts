import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';

// Importa só o core + as linguagens usadas nos posts (em vez do bundle completo
// do highlight.js, que tem ~1 MB). Os aliases comuns (js, ts, html, sh…) já vêm
// declarados em cada módulo de linguagem.
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('python', python);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Instância isolada do `marked` com realce de sintaxe via `highlight.js`. A
 * função de highlight é síncrona, então `parse` também é — permitindo render
 * direto (sem Promise) tanto no serviço quanto nos testes. Linguagens não
 * registradas caem para texto escapado (sem realce).
 */
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight: (code, lang) =>
      lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : escapeHtml(code),
  }),
);

/** Converte Markdown em HTML, com blocos de código já realçados. */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}
