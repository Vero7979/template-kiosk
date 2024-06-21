import {
  app,
  shell,
  screen,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
} from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

export type MainOptions = {
  browser?: BrowserWindowConstructorOptions;
};

export type MainReturnParams = {
  window: BrowserWindow;
};

export type InferMainAPI<T> = T extends Main<infer X> ? X : never;

export default class Main<API extends object> {
  private _options?: MainOptions;
  protected get options() {
    return this._options;
  }

  private _window?: BrowserWindow;
  public get window() {
    return this._window!;
  }

  private _api?: API;
  public get api() {
    return this._api!;
  }

  constructor(api?: API, options?: MainOptions) {
    this._api = api;
    this._options = options;
    this._setup();
  }

  private async _setup() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.whenReady().then(() => {
      // Set app user model id for windows
      electronApp.setAppUserModelId("com.electron");

      // Default open or close DevTools by F12 in development
      // and ignore CommandOrControl + R in production.
      // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
      app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
      });

      this._window = this._createWindow(this._options?.browser);

      app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0)
          this._window = this._createWindow(this._options?.browser);
      });

      //provide api
      this._provide(this._api);
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });
  }

  private _createWindow(
    options?: BrowserWindowConstructorOptions
  ): BrowserWindow {
    var display = screen.getPrimaryDisplay();

    const { width, height } = display.workAreaSize;

    // Create the browser window.
    const window = new BrowserWindow({
      width,
      height,
      maxWidth: 99999,
      maxHeight: 99999,
      show: false,
      frame: false,
      alwaysOnTop: true,
      kiosk: true,
      autoHideMenuBar: true,
      ...(process.platform === "linux" ? { icon } : {}),
      ...options,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false,
        ...options?.webPreferences,
      },
    });

    window.on("ready-to-show", () => {
      window.show();
    });

    window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      window.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      window.loadFile(join(__dirname, "../renderer/index.html"));
    }

    return window;
  }

  private _provide(api?: API) {
    Object.entries(api || {}).forEach(([key, value]) =>
      typeof value === "function"
        ? ipcMain.handle(`remote__${key}`, (e, ...args) => value(...args))
        : null
    );
  }
}
