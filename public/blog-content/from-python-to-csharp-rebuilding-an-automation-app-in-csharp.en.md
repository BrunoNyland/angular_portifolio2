# From Python to C# - Rebuilding an automation app in C#

Project Link: https://github.com/BrunoNyland/digita_senha

---

Everyone has run into a daily problem that calls for an automation. And I love automation! So much so that my house is full of **Alexas**.

In the day-to-day of customer service, due to the lack of a single unified login in our systems, we found ourselves forced to type our username, passwords, and PINs hundreds of times a day. This not only slowed down service but made the routine tiring.

Some agency colleagues and I used to use tools like **HotVirtualKeyboard** and **AutoHotkey** for this. It worked, but it was a workaround. Every window required a different configuration, and configuring multiple hotkeys was a pain. With some complaints from my colleague Edivanio about this, the idea for this system came up.

To solve this, I originally created this app in Python. Although it solved the problem, there were lag issues at startup, and the executable was extremely heavy, **passing 100mb**. In addition, the program crashed randomly. Even changing the UI library from PySide2 to Tkinter (which is native to Python), the problem persisted. After a lot of insistence and research, I decided to drop Python.

I then decided to make the definitive migration to **C#**, since it is one of the languages I am studying. The result surprised me. I used the help of **Gemini 3.1 Pro** and it was simply fantastic. The migration was super fast and painless. In the beginning, I was going to use VSCode, but I decided to give it a chance and test the **Antigravity IDE** because it pairs well with **Google's AI**.

And that was it. In the following, I will detail the role of each file created in the project.

---

## Project Structure and Its Files

To keep the project clean, modular, and easy to maintain, I organized the structure using the **MVVM (Model-View-ViewModel)** pattern. Here is the role of each file:

### 1. Project Settings and Dependencies

- **DigitaSenha.csproj**: Defines that the app is a Windows executable (`WinExe`), uses .NET 10, combines WPF and Windows Forms (necessary for the tray icon), and manages dependencies. The main libraries used are:
  - `WPF-UI`: For the modern design based on Windows 11.
  - `H.InputSimulator`: To simulate typing and keyboard clicks.
  - `NHotkey.Wpf`: To listen and register our global shortcut.
  - `CommunityToolkit.Mvvm`: To facilitate data binding and commands on screen.

### 2. Entry Point and Main Control

- **App.xaml** and **App.xaml.cs**: This is where the lifecycle of the program is managed. In addition to initializing the application, it performs the following critical functions:
  - **Single Instance Lock (Mutex)**: Ensures that only one executable runs at a time. If you try to open the program twice, it displays a warning and closes the copy, preventing two robots from competing for the keyboard.
  - **Custom Tray Icon**: Initializes the icon in the Windows tray, and adds click and menu functions.
  - **Thread Handling**: When the keyboard shortcut is pressed, it dispatches the automation in a separate thread (`Task.Run()`), maybe this is unnecessary 🤣 but who knows, just in case?

### 3. Data Models (Models)

- **Credentials.cs**: Defines the structure of the information the user types on the screen (Username, Password, UC Password, and Smartcard PIN).
- **WindowMappingsConfig.cs**: Maps the structure of our configuration file `window_mappings.json`, which links window names to keyboard actions.

### 4. Business Logic and Infrastructure (Core)

- **WindowMappings.cs**: Loads and saves the rules from `window_mappings.json`. This is what allows anyone to configure new window titles in Notepad, being able to add new window titles.
- **CredentialService.cs**: Handles security. It saves the preferred keyboard shortcut in the Windows Registry and encrypts user passwords using the native Windows Data Protection API (**DPAPI** - `ProtectedData`), ensuring that no one can steal credentials even if they access the computer.
- **WindowHelper.cs**: Uses direct Windows API calls (Win32 - `GetForegroundWindow` and `GetWindowText`) to obtain the exact title of the focused window at the moment the shortcut is pressed.
- **AutomationEngine.cs**: Here lies the logic of analyzing the active window title, choosing the correct strategy based on the JSON, and simulating the typing with precision.

### 5. Graphical Interface (MVVM View/ViewModel)

- **SettingsViewModel.cs**: Bridges the encrypted data of `CredentialService` and the visual interface. It populates the shortcut list on the screen, validates passwords, and reacts to the user's save commands.
- **SettingsWindow.xaml** and **SettingsWindow.xaml.cs**: The visual window of the app. It uses the `WPF-UI` style with rounded corners, dark background, and the Mica effect. The closing of the window (`X`) was rewritten to just hide the screen (`Hide()`), keeping the application running silently in the tray.
