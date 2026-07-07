# Token vale Ouro: Como Economizar até 90% dos Tokens no Desenvolvimento com IA

Se você utiliza assistentes de IA para programação de forma intensiva, já deve ter se deparado com dois grandes problemas: a "inflação" na conta de tokens e o "apodrecimento do contexto" (*context rot*), onde a IA começa a esquecer regras e alucinar após algumas interações.

Para resolver isso, este guia vai te ensinar a instalar e configurar as três ferramentas mais poderosas do momento ([Graphify](https://pypi.org/project/graphifyy/), [RTK](https://rtk-ai.app/) e [GSD Core](https://www.npmjs.com/package/@opengsd/gsd-core)) em três ambientes diferentes (Claude Code, OpenCode e Antigravity CLI). Além disso, configuraremos regras globais para uso forçado de subagentes e compactação precoce do contexto.

---

## 1. Graphify: O Fim das Buscas Cegas

O **[Graphify](https://pypi.org/project/graphifyy/)** substitui a leitura de arquivos brutos por um grafo de conhecimento semântico e estrutural. Quando você faz uma pergunta sobre o projeto, em vez de a IA fazer um grep e ler dezenas de arquivos inteiros, ela consulta esse grafo compacto.

**Por que economiza tokens?** Ao permitir que a IA navegue por conexões (nós e arestas) em vez de textos longos de arquivos de código, o Graphify consegue reduzir o consumo de tokens em até **71,5 vezes** por consulta.

### Como Instalar e Usar

Primeiro, instale o CLI globalmente na sua máquina usando o gerenciador de pacotes de sua preferência (ex: UV ou pip):

```bash
pip install graphifyy
```

- **No Claude Code:** Na raiz do seu projeto, rode `graphify claude install`. Isso criará um arquivo `CLAUDE.md` e um hook `PreToolUse` que obriga o Claude a consultar o grafo antes de tentar ler seus arquivos.
- **No OpenCode:** Rode `graphify opencode install`. Isso gravará as instruções diretamente no arquivo `AGENTS.md` do seu projeto.
- **No Antigravity:** O Graphify ainda não possui um instalador automático para o Antigravity listado em seus comandos. Para usá-lo, você deve gerar o grafo rodando `/graphify .` e incluir manualmente instruções no seu arquivo de regras do Antigravity (geralmente `.agents/rules/`) para que ele sempre leia o arquivo `graphify-out/GRAPH_REPORT.md` antes de fazer buscas.

---

## 2. RTK (Rust Token Killer): O Filtro de Terminal

O **[RTK](https://rtk-ai.app/)** atua como um proxy (intermediário) super-rápido no seu terminal. Sempre que a IA tenta rodar comandos com retornos gigantescos (como `npm install`, `git status`, `cargo test`), o RTK intercepta, filtra o "ruído" e devolve apenas as informações essenciais para a janela de contexto.

**Por que economiza tokens?** O RTK gera uma economia direta de **60% a 90%** (chegando a 99% em comandos de testes como jest ou vitest) no consumo gerado pelas saídas do terminal.

### Como Instalar e Usar

Para instalar a ferramenta base no Mac/Linux:

```bash
curl -sSL https://rtk-ai.app/install.sh | bash
```
*(No Windows, baixe o binário e coloque no seu PATH, ou use WSL para suporte total aos hooks).*

Depois de instalado, configure no seu agente:

- **No Claude Code:** Rode `rtk init -g`. Isso configura o hook nativo.
- **No OpenCode:** Rode `rtk init -g --opencode`. O RTK será instalado como um plugin TypeScript no OpenCode.
- **No Antigravity:** Rode `rtk init --agent antigravity`. O RTK adicionará as instruções no arquivo `.agents/rules/antigravity-rtk-rules.md` para guiar a IA.

---

## 3. GSD Core (Get Shit Done): O Maestro de Subagentes

O **[GSD Core](https://www.npmjs.com/package/@opengsd/gsd-core)** é um framework focado no desenvolvimento guiado por especificações. Ele quebra tarefas grandes em planos atômicos que são executados em janelas paralelas.

**Por que economiza tokens?** Ele resolve o "apodrecimento de contexto". Em vez de entupir a sessão principal com execuções de código e logs de erro, o GSD isola essas tarefas pesadas delegando-as para subagentes que iniciam com uma janela de contexto 100% limpa (até 200k tokens). A sua janela principal se mantém operando entre 30% e 40% de uso, operando com máxima qualidade sem acumular lixo de conversas anteriores.

### Como Instalar e Usar

A instalação é idêntica para qualquer um dos 3 assistentes, pois o GSD utiliza um instalador interativo universal. No terminal do seu projeto, rode:

```bash
npx @opengsd/gsd-core@latest
```

> **Observação:** A ferramenta mudou de nome recentemente de `get-shit-done-cc` para `@opengsd/gsd-core`.

Durante o assistente interativo, o instalador perguntará qual o seu ambiente (runtime) de IA. Basta você selecionar Claude Code, OpenCode ou Antigravity CLI na lista fornecida e o instalador fará toda a adaptação automaticamente.

Depois, é só usar os comandos padrão do fluxo de 5 etapas, como `/gsd:new-project`, `/gsd:plan-phase`, e `/gsd:execute-phase`.

---

## 4. Instruções Globais: Forçando o Uso de Subagentes

Mesmo sem rodar o fluxo completo do GSD o tempo todo, você pode (e deve) instruir o seu assistente de IA a delegar o trabalho manual para preservar o contexto.

**Como fazer:** Localize o arquivo de memória base do seu projeto. No Claude é o `CLAUDE.md`, no OpenCode é o `agents.md`, e no Antigravity são os arquivos `.agents/rules/*.md`. Adicione o seguinte bloco de regras:

> **Regra Global de Arquitetura:**
> "Sempre que estiver no modo de edição/construção, nunca implemente os recursos você mesmo na janela de contexto principal. Use o tempo todo subagentes ou agentes de background para delegar tarefas (como pesquisa, refatoração e implementação). Atue apenas como um coordenador. Os subagentes devem executar a tarefa em paralelo sempre que possível e devolver apenas o resumo final do que foi feito para a sessão principal."

**Impacto nos tokens:** Como o subagente não polui a janela de contexto principal com tentativas falhas de código ou retornos imensos de execução, sua sessão principal gasta uma fração mínima de tokens para entender que a tarefa foi concluída com sucesso.

---

## 5. Instruções Globais: Compactação Precoce do Contexto

Com as janelas de contexto gigantescas dos modelos atuais, a IA tende a ir acumulando o histórico de conversa passivamente. Para manter o consumo barato e a inteligência afiada, devemos forçar a IA a se auto-compactar com antecedência. No ecossistema OpenCode e Claude, existe um mega-pacote de otimização chamado "Everything Claude Code" que provou o valor dessa tática.

**Como fazer:** Junte essa regra ao seu arquivo de memória principal (`CLAUDE.md` no Claude Code, `agents.md` no OpenCode ou nas regras do Antigravity) para programar a IA a se autogerenciar:

> **Regra Global de Gerenciamento de Contexto:**
> "Monitore ativamente o uso da sua janela de contexto. Quando atingir 50% da capacidade, pare e faça uma compactação do contexto (ou avise o usuário para rodar a ferramenta de compactação). Resuma as decisões de arquitetura e o estado atual da tarefa, preservando apenas os destaques técnicos e descartando as tentativas anteriores e logs de conversa para liberar espaço."

Além das instruções automatizadas, você pode atuar manualmente ao longo da sessão:

- **Comando de Compactação (`/compact`):** No Claude Code, sempre que sentir que a conversa se estendeu demais, você pode rodar esse comando (ex: `/compact preserve somente as decisões de arquitetura`) para a IA fazer um resumo da sessão até ali e apagar o resto.
- **Comandos de Limpeza (`/clear` ou `/new`):** Começou uma feature nova? Não continue no mesmo chat! Use `/clear` no Claude Code ou `/new` no OpenCode para zerar a janela e iniciar com a memória fresca. O framework GSD incentiva que nenhuma sessão dependa de histórico longo de chat, mantendo tudo salvo apenas nos arquivos no disco (como os arquivos `.md` na pasta `.planning`).

**Impacto nos tokens:** A estratégia de acionar a compactação precocemente (quando o contexto bate em 50%) aliada a limites de *thinking tokens* corta os custos em cerca de 60% sem perder a qualidade nas tarefas (como demonstrado pelo sistema Everything Claude Code). Além disso, a documentação do GSD alerta que a qualidade máxima de raciocínio da IA só ocorre quando o contexto está entre 0 e 30%. Passou de 50%, a IA já começa a cortar caminhos.

---

## Conclusão: O Segredo é a Engenharia de Contexto

Codificar com IA deixou de ser apenas sobre "escrever bons prompts". Se tornou **engenharia de contexto**.

- **Graphify** evita que a IA leia e processe lixo abrindo arquivos desnecessários, reduzindo a conta da busca em até 71,5 vezes.
- **RTK** corta o ruído absurdo que saídas de terminal jogam diretamente no contexto, filtrando de 60% a 90% dos logs.
- **GSD Core** resolve o "apodrecimento de contexto", isolando execuções complexas para subagentes que nascem e morrem com janelas 100% limpas.

Junte essas três abordagens no Claude Code, OpenCode ou Antigravity, aplique as regras globais, e você transformará assistentes que antes ficavam "burros e caros" ao longo do dia em uma esteira de produção escalável, implacável e extremamente econômica!
