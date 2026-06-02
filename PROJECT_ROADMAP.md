# Bruno Nyland — Portfolio 2026
## Roadmap de Finalização

Este documento apresenta uma análise profunda do estado atual do portfólio Angular 21, avaliando a arquitetura do código, o sistema de animações, a experiência visual e a integração com as ferramentas auxiliares do projeto. Em seguida, fornece sugestões de melhorias práticas e um roadmap detalhado para finalizar a aplicação.

## 1. Sugestões de Melhorias

### A. Integração do Banco de Certificados (Página Separada com Estatísticas)
O projeto conta com um utilitário local em `tools/certificates-manager.html` que gerencia e exporta o arquivo `public/certificates/certificates.json`. Este arquivo possui **mais de 40 certificados** detalhados (com temas, especializações, carga horária e links).
- **Sugestão 1: Rota Autônoma `/certificados`:** Criar uma rota separada no Angular dedicada aos certificados, garantindo que a página inicial continue leve e focada na apresentação principal.
- **Sugestão 2: Carregamento Completo & Filtros:** Como os certificados são documentos estáticos leves, carregar todos de uma vez no cliente. Implementar um input de pesquisa textual e filtros rápidos por plataforma (AdaTech, Coursera, ENAP), idioma e tópicos.
- **Sugestão 3: Painel de Estatísticas de Estudo:** Apresentar na parte superior da página métricas consolidadas e computadas dinamicamente via Signals:
  - **Total de horas estudadas** (soma de todas as cargas horárias dos certificados).
  - **Gráfico ou cards com quantidades de horas estudadas por temas** (ex: Angular: 110h, Python: 20h, Excel: 85h, etc.).
- **Sugestão 4: Visualizador de PDFs:** Vincular a listagem aos arquivos PDF locais que já estão na pasta `/public/certificates/`, permitindo que o visitante visualize os documentos em nova aba.

### B. Acessibilidade e Melhoria Visual
- **Contraste do Tema Escuro:** O tom de cinza do texto secundário (`--fg-mute: #555` e `--fg-dim: #8a8a8a`) contra o fundo escuro (`#0a0a0a`) pode falhar nos testes de contraste da WCAG para acessibilidade visual. Recomenda-se clarear ligeiramente estes tons.

### C. SEO Dinâmico e Internacionalização (i18n)
O site é totalmente bilíngue (PT/EN), no entanto:
- O título e a descrição SEO no `src/index.html` são estáticos e estão fixos em português.
- **Sugestão:** Injetar os serviços `Title` e `Meta` do Angular no `ContentService` para que, ao chamar `setLang()`, as tags `<title>` e `<meta name="description">` sejam atualizadas de forma dinâmica.

---

## 2. Roadmap de Finalização (Passo a Passo)

### Fase 1: Correções Críticas & SEO Dinâmico
- [ ] **Configuração de Metadados:** Importar `Title` e `Meta` de `@angular/platform-browser` e atualizar o título e meta descrição dinamicamente no `ContentService.setLang()`.
- [ ] **Ajustes de Contraste:** Melhorar as variáveis `--fg-mute` e `--fg-dim` em `src/styles.scss` para garantir boa legibilidade em qualquer dispositivo.

### Fase 2: Página de Certificados Separada (com Estatísticas)
- [ ] **Serviço de Certificados:** Desenvolver o `CertificatesService` que consome o JSON `/public/certificates/certificates.json` usando `HttpClient`.
- [ ] **Roteamento:** Configurar a rota `/certificados` no roteador do Angular.
- [ ] **Painel de Estatísticas:** Criar propriedades computadas reativas (`computed` do Angular) para:
  - Somar a carga horária total (fazendo parse de strings como "48h", "30hs" ou "60h (3 Courses)" para inteiros).
  - Agrupar e somar a quantidade de horas estudadas por temas/tópicos (ex: mapeando o array de `topics` de cada curso).
- [ ] **Filtros e Busca em Tempo Real:** Criar inputs controlados por signals (`searchTerm`, `selectedPlatform`, `selectedTopic`) que filtram instantaneamente o array completo carregado em memória.
- [ ] **Apresentação Visual:** Exibir o painel de estatísticas no topo em formato de cards visuais premium e, abaixo dele, a lista completa dos certificados com botões de link direto para os arquivos PDF locais e URLs de validação.

### Fase 3: Refinamento de Dados e Blog com Markdown (.md)
- [ ] **Atualização de Projetos:** Alterar a tipagem do projeto em `content.types.ts` para incluir links e substituir os textos descritivos temporários por dados reais no `content.data.ts`.
- [ ] **Infraestrutura e Índice do Blog:** Criar a pasta `/public/blog/`, adicionar os arquivos `.md` e criar o arquivo de índice `/public/blog/posts.json` contendo o array de metadados dos posts.
- [ ] **Seleção de Destaques na Home:** Atualizar a seção do blog na home (`BlogComponent`) para baixar o arquivo `posts.json` via `BlogService` e mostrar apenas posts marcados com `featured: true` (evitando requisições excessivas de arquivos `.md`).
- [ ] **Página Geral do Blog (`/blog`):** Desenvolver uma página de índice geral do blog contendo:
  - Filtro por tags e busca por palavra-chave utilizando reatividade com *Angular Signals* (`computed`).
  - Infinite Loader (Scroll Infinito) automatizado utilizando a API do navegador `IntersectionObserver` para carregar novos itens dinamicamente à medida que o usuário rola o rodapé da página.
- [ ] **Serviço e Tela de Detalhes do Post:** Implementar o método `getPost(slug)` no `BlogService` para baixar o arquivo `.md` sob demanda e renderizá-lo na rota dinâmica `/blog/:slug` de forma segura (usando `DomSanitizer`), adicionando realce de sintaxe de código (syntax highlighting) para desenvolvedores.

