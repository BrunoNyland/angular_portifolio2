# De Python para C# - Recontruindo um app de automação em C#

Link do Projeto: https://github.com/BrunoNyland/digita_senha

---

Todo mundo já se deparou com um problema cotidiano que pede uma automação. E eu adoro automação! Tanto que minha casa é cheia de **Alexas**.

No dia a dia do atendimento ao público, devido à ausência de um login único unificado nos sistemas, nos víamos obrigados a digitar matrícula, senhas e PINs centenas de vezes ao dia. Isso não só atrasava os atendimentos como tornava a rotina cansativa.

Eu e alguns colegas de agencia costumavamos usar ferramentas como **HotVirtualKeyboard** e **AutoHotkey** para isso. Funcionava mas era uma gambiarra. Cada janela exigia uma configuração diferente, e configurar várias teclas de atalho. Com algumas reclamações do colega Edivanio quanto a isso, acabou surgindo a ideia deste sistema.

Para resolver isso, criei originalmente este app em Python. Embora resolvesse o problema, havia problemas de lentidão na inicialização, e o executavel era extremamente pesado **passando de 100mb**. Além disso o programa apresentava travamentos aleatórios, mesmo trocando a interface de PySide2 para Tkinter que é nativo do Python o problema persistiu. Depois de muita insistência e pesquisa decidi largar mão do Python.

Decidi então fazer a migração definitiva para **C#**, visto que é uma das linguagens que estou estudando. O resultado me surpreendeu. Utilizei a ajuda da **Gemini 3.1 Pro** e foi simplesmente fantástico. A migração foi super rápida e sem dores de cabeça. No inicio eu iria usar o VSCode, mas resolvi dar uma chance e testar o **Antigravity IDE** pois casa bem com a **IA do Google**.

E foi isso. Na sequência vou detalhar o papel de cada arquivo criado no projeto.

---

## A Estrutura do Projeto e Seus Arquivos

Para manter o projeto limpo, modular e fácil de manter, organizei a estrutura utilizando o padrão **MVVM (Model-View-ViewModel)**. Aqui está o papel de cada arquivo:

### 1. Configurações e Dependências do Projeto

- **DigitaSenha.csproj**: Define que o app é um executável de Windows (`WinExe`), utiliza o .NET 10, combina WPF e Windows Forms (necessário para o ícone de bandeja) e gerencia as dependências. As principais bibliotecas utilizadas são:
  - `WPF-UI`: Para o design moderno baseado no Windows 11.
  - `H.InputSimulator`: Para simular a digitação e cliques do teclado.
  - `NHotkey.Wpf`: Para escutar e registrar nosso atalho global.
  - `CommunityToolkit.Mvvm`: Para facilitar o binding de dados e comandos na tela.

### 2. O Ponto de Entrada e Controle Principal

- **App.xaml** e **App.xaml.cs**: Aqui o ciclo de vida do programa é gerenciado. Além de inicializar a aplicação, ele realiza as seguintes funções críticas:
  - **Trava de Instância Única (Mutex)**: Garante que apenas um executável rode por vez. Se você tentar abrir o programa duas vezes, ele exibe um aviso e fecha a cópia, evitando que dois robôs concorram pelo teclado.
  - **Bandeja (Tray Icon) Personalizada**: Inicializa o ícone na bandeja do Windows, e adiciona funções de clique e menu.
  - **Tratamento de Threads**: Quando o atalho de teclado é pressionado, ele despacha a automação em uma thread separada (`Task.Run()`), talvez isso seja desnecessário 🤣 mas por segurança quem sabe?

### 3. Modelos de Dados (Models)

- **Credentials.cs**: Define a estrutura das informações que o usuário digita na tela (Matrícula, Senha, Senha UC e PIN do Smartcard)
- **WindowMappingsConfig.cs**: Mapeia a estrutura do nosso arquivo de configurações `window_mappings.json`, que liga os nomes das janelas as ações do teclado.

### 4. Lógica de Negócios e Infraestrutura (Core)

- **WindowMappings.cs**: Carrega e salva as regras do arquivo `window_mappings.json`. É ele quem permite que qualquer pessoa configure novos títulos de janelas no Bloco de Notas. podendo adicionar novos títulos de janelas.
- **CredentialService.cs**: Lida com a segurança. Ele salva o atalho de teclado preferido no Registro do Windows e criptografa as senhas do usuário usando a API nativa de proteção de dados do Windows (**DPAPI** - `ProtectedData`), garantindo que ninguém consiga roubar as credenciais mesmo que acesse o computador.
- **WindowHelper.cs**: Utiliza chamadas diretas de API do Windows (Win32 - `GetForegroundWindow` e `GetWindowText`) para obter o título exato da janela focada no instante em que o atalho é pressionado.
- **AutomationEngine.cs**: Aqui fica a logica da analise do título da janela ativa, escolhe a estratégia correta com base no JSON e simula a digitação com precisão.

### 5. A Interface Gráfica (MVVM View/ViewModel)

- **SettingsViewModel.cs**: Faz a ponte entre os dados criptografados do `CredentialService` e a interface visual. Ele preenche a lista de atalhos da tela, valida as senhas e reage aos comandos de salvar do usuário.
- **SettingsWindow.xaml** e **SettingsWindow.xaml.cs**: A janela visual do app. Utiliza a estilização `WPF-UI` com cantos arredondados, fundo escuro e o efeito Mica. O fechamento da janela (`X`) foi reescrito para apenas ocultar a tela (`Hide()`), mantendo a aplicação rodando silenciosamente na bandeja.

---
