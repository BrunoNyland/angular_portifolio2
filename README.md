# Angular Portfólio 2

Portfólio pessoal desenvolvido com Angular para apresentar perfil profissional, experiência, projetos selecionados, stack e formas de contato. A interface combina animações com GSAP, navegação suave com Lenis e uma cena de fundo em 3D.

## Destaques

- Conteúdo bilíngue em português e inglês.
- Seções para sobre, skills, projetos, experiência, blog e contato.
- Loader inicial, indicador de progresso, cursor customizado e botão de voltar ao topo.
- Layout responsivo com foco em apresentação visual e animações de scroll.

## Stack

- Angular 21
- TypeScript
- GSAP
- Lenis
- Three.js
- RxJS

## Como rodar localmente

```bash
npm install
npm start
```

Depois disso, abra `http://localhost:4200/`.

## Scripts

- `npm start`: inicia o servidor de desenvolvimento.
- `npm run build`: gera a versão de produção em `dist/`.
- `npm test`: executa os testes com Vitest.
- `npm run watch`: recompila em modo observação durante o desenvolvimento.

## Estrutura

- `src/app/sections`: seções principais do portfólio.
- `src/app/chrome`: componentes de interface, como navegação, loader e rodapé.
- `src/app/content`: dados e serviços de conteúdo bilíngue.
- `src/app/scene`: lógica da cena de fundo.
- `src/app/tweaks`: ajustes finos de comportamento visual e de animação.

## Observações

O projeto foi criado com Angular CLI e usa a estrutura padrão de uma aplicação standalone moderna. O conteúdo exibido na interface está centralizado nos arquivos de conteúdo em `src/app/content`.
