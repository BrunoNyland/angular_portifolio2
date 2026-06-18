# O Apocalipse dos Devs: Como garantir a qualidade do código gerado por IA?

Assistindo a um vídeo do [Lucas Montano](https://www.youtube.com/watch?v=T9V7EyB_B9w) ele deixou alguns importantes insigts que vou registrar aqui neste post.

Com ascensão das Inteligências Artificiais e a tendência do "vibe coding" (onde devs apenas orquestram prompts) fica um alerta: a possibilidade de um apagão de desenvolvedores seniores. Com a IA gerando cada vez mais código, sistemas complexos correm o risco de se tornarem caros e arriscados de manter caso os profissionais esqueçam os fundamentos essenciais.

Logo irei detalhar pilares indispensáveis que precisamos aplicar nos projetos com IA:

---

## ⚡ Performance: Os Bugs Silenciosos

A inteligência artificial adora gerar código que parece funcionar perfeitamente no ambiente local, mas que pode desmoronar em produção. É aqui que os detectores de performance entram em cena:

### Detector de N+1
* **O que é:** Um problema clássico onde a IA cria loops fazendo queries individuais no banco de dados, em vez de usar comandos em lote (batch ou join). Para evitar isso, você pode criar um middleware que conta a quantidade de queries executadas por requisição.
* **Por que é importante:** No ambiente de desenvolvimento, com poucas requisições, tudo flui bem. Mas em produção, uma requisição pode se multiplicar rapidamente; 10.000 requisições podem gerar 200.000 chamadas ao banco de dados, derrubando o seu sistema. O detector (configurado para alertar caso passe de um limite, como 15 queries) evita que esse gargalo chegue em produção.

### Detector de Race Condition (Condição de Corrida)
* **O que é:** Um bug que ocorre quando a IA encadeia operações assíncronas (como vários `await`) sem prever o que acontece se duas requisições simultâneas chegarem ao mesmo tempo no final do processo. Uma forma de detectar isso é através do *Property-Based Testing* (teste baseado em propriedades), usando bibliotecas que bombardeiam a função para verificar o resultado final.
* **Por que é importante:** Falhas de race condition são terríveis de debugar e podem causar problemas graves, como saldo negativo na conta de um usuário, *double booking* (reservas duplicadas) ou até travamentos severos (*deadlocks*).

### Detector de Memory Leak (Vazamento de Memória)
* **O que é:** Ocorre quando recursos continuam consumindo memória sem necessidade, como uma fila que nunca esvazia ou um cache em memória sem tempo de expiração (TTL). É identificado usando ferramentas de *profiling* (como `py-spy`, `pprof` ou Chrome DevTools) para monitorar o consumo de CPU e memória do processo ativo.
* **Por que é importante:** Em desenvolvimento, a aplicação roda por pouco tempo e o vazamento passa batido. Em produção, a memória da aplicação pode saltar de 200 MB para 2 GB ao longo do dia, até que o sistema operacional seja forçado a matar o processo (o famoso erro "Out of Memory").

---

## 🔒 Segurança: Protegendo as Portas do Sistema

Com o aumento dos ataques à cadeia de suprimentos (*supply chain attacks*), validar a segurança do código gerado (ou importado) é inegociável.

* **Lint de Security:** O uso de ferramentas como `Bandit` ou `Semgrep` para analisar estaticamente o código em busca de padrões e vulnerabilidades conhecidas. Elas barram código inseguro antes mesmo dele ser executado.
* **Secret Scan:** Ferramentas que varrem seu código para garantir que nenhuma credencial, chave de API ou senha esteja sendo comitada acidentalmente no repositório.
* **Scan de lib exploit:** É a prática de rodar verificações (por exemplo, automatizadas no GitHub Actions) em bibliotecas de terceiros para buscar vulnerabilidades recém-descobertas (*exploits*). Fundamental para mitigar riscos de dependências maliciosas.
* **Pinar versão nas dependências:** Fixar as versões exatas das bibliotecas que você utiliza (em vez de deixar o gerenciador atualizar automaticamente). Isso é vital para garantir que uma atualização sorrateira não quebre sua aplicação ou introduza uma brecha de segurança sem que você perceba.

---

## 🏛️ Arquitetura: A Visão do Todo

A IA consegue escrever a função perfeitamente, mas ela não pensa no impacto sistêmico ou nos piores cenários.

### Conhecer os seus tradeoffs
* **O que é:** Entender o diagrama do seu sistema e aceitar que não existe uma arquitetura perfeita para tudo. Toda escolha tem seu custo.
* **Por que é importante:** Um verdadeiro sênior não fala apenas o quanto sua arquitetura é boa, mas entende claramente o que está "deixando na mesa" (as desvantagens) ao tomar aquela decisão arquitetural.

### Confiabilidade (Teste de falha, etc.)
* **O que é:** Desenvolver garantias e realizar testes para ver como a aplicação se comporta em cenários adversos. A IA escreve o código do "caminho feliz", mas muitas vezes ignora as exceções e falhas de infraestrutura.
* **Por que é importante:** Ajuda a manter a resiliência do sistema e evita que um simples erro em cadeia derrube toda a aplicação.

### Contingências (O que acontece se teu banco cair, etc.)
* **O que é:** O planejamento para lidar com quedas de serviços cruciais. Por exemplo, saber exatamente o que o código faz caso o banco de dados pare de responder bem no meio de uma requisição.
* **Por que é importante:** É esse nível de preparo e conhecimento estrutural que fará com que um desenvolvedor continue sendo indispensável e valioso no mercado, pois a IA sozinha (e barata) ainda não tem a capacidade de arquitetar e gerenciar esse tipo de contingência de forma autônoma e segura.

---

## Em resumo

A IA pode ser a nova força motriz na geração de linhas de código, mas quem detém o domínio sobre performance, segurança e arquitetura continuará no comando.
