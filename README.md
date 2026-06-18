# LESS-NOTE

LESS-NOTE is a visual board app inspired by Milanote and PureRef. The frontend is still your React + Vite app, but this repo is now scaffolded to run as a desktop app with Tauri.

## What Tauri is

Tauri gives your web app a native desktop window.

That means:

- your UI still lives in `src/` and is written in React
- Tauri adds a Rust desktop shell in `src-tauri/`
- during development, Tauri opens your Vite app inside a desktop window
- when you build for release, Tauri packages the app into an installable desktop app

You do **not** need to rewrite your whole app in Rust.

## What changed in this repo

Desktop-related files now live here:

- [package.json](/e:/LESS-NOTE/package.json)
- [src-tauri/tauri.conf.json](/e:/LESS-NOTE/src-tauri/tauri.conf.json)
- [src-tauri/Cargo.toml](/e:/LESS-NOTE/src-tauri/Cargo.toml)
- [src-tauri/src/main.rs](/e:/LESS-NOTE/src-tauri/src/main.rs)
- [src-tauri/src/lib.rs](/e:/LESS-NOTE/src-tauri/src/lib.rs)

Useful scripts:

- `npm run dev`  
  browser-only Vite dev server
- `npm run dev:desktop`  
  fixed-port Vite dev server for Tauri
- `npm run desktop:dev`  
  starts the Tauri desktop app in development
- `npm run desktop:build`  
  builds an installable desktop app

## What you still need to install on Windows

Right now this machine is missing Rust, so Tauri cannot run yet.

You need these Windows prerequisites:

1. Microsoft C++ Build Tools
   Install Visual Studio Build Tools and select `Desktop development with C++`.

2. WebView2 Runtime
   On most Windows 10/11 systems it is already installed.

3. Rust with the MSVC toolchain
   Easiest option:

   ```powershell
   winget install --id Rustlang.Rustup
   ```

   Then restart your terminal.

After that, this should work:

```powershell
cargo -V
rustc -V
```

If `cargo` is still not recognized, restart your terminal or your PC.

## How to run the desktop app

Once the prerequisites are installed:

```powershell
npm install
npm run desktop:dev
```

What happens:

1. Tauri runs `npm run dev:desktop`
2. Vite serves your React app on `http://127.0.0.1:4173`
3. Tauri opens a native desktop window and loads that app inside it

## How to build an installable app

When you want a desktop build:

```powershell
npm run desktop:build
```

Tauri will:

1. run `npm run build`
2. compile the Rust shell
3. bundle the app for Windows

Build output will be created under `src-tauri/target/`.

## What to know as a beginner

### 1. Your users do not need Rust

Rust and the C++ build tools are only for you as the developer.
Once you ship the packaged app, your users just install the app normally.

### 2. The frontend is still your main app

Most of your day-to-day work will still happen in:

- [src/App.tsx](/e:/LESS-NOTE/src/App.tsx)
- [src/App.css](/e:/LESS-NOTE/src/App.css)

### 3. `src-tauri/` is the desktop layer

You only touch Rust when you want desktop-specific features like:

- real file open/save dialogs
- filesystem access
- native menus
- native window controls
- system integrations

### 4. Browser storage is okay for now, but not the final desktop path

Your app currently behaves like a web app in some places, especially persistence.

For a proper desktop app, the next big improvement should be:

- save boards as real files on disk
- add `Open`, `Save`, and `Save As`
- stop relying on browser-style storage as the main persistence layer

### 5. Tauri development uses a fixed port here on purpose

Tauri needs to know exactly where your dev server lives, so this setup uses:

- `127.0.0.1`
- port `4173`

That is why there is a separate `dev:desktop` script.

## Recommended next steps

1. Install Rust and confirm `cargo -V` works
2. Run `npm run desktop:dev`
3. Confirm the app opens in a native Tauri window
4. Replace local browser-style persistence with real desktop file saving
5. Replace the default Tauri icons with LESS-NOTE branding

## Official docs I used

- Tauri prerequisites: https://v2.tauri.app/start/prerequisites/
- Tauri create/init docs: https://v2.tauri.app/start/create-project/
- Tauri config overview: https://v2.tauri.app/develop/configuration-files/
