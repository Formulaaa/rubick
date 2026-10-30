import electron, { app, type BrowserWindow, globalShortcut } from 'electron';
import commonConst from '../common/utils/commonConst';
import { guide, main } from './browsers';
import API from './common/api';
import {
  getSearchFiles,
  macBeforeOpen,
  putFileToRubick,
} from './common/getSearchFiles';
import winPosition from './common/getWinPosition';
import localConfig from './common/initLocalConfig';
import registerHotKey from './common/registerHotKey';
import createTray from './common/tray';

import '../common/utils/localPlugin';

import registerSystemPlugin from './common/registerSystemPlugin';
import checkVersion from './common/versionHandler';

class App {
  public windowCreator: {
    init: () => Promise<void>;
    getWindow: () => BrowserWindow;
  };
  private systemPlugins: any;

  constructor() {
    this.windowCreator = main();
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
    } else {
      this.systemPlugins = registerSystemPlugin();
      this.beforeReady();
      this.onReady();
      this.onRunning();
      this.onQuit();
    }
  }
  beforeReady() {
    // 系统托盘
    if (commonConst.macOS()) {
      macBeforeOpen();
      if (commonConst.production() && !app.isInApplicationsFolder()) {
        app.moveToApplicationsFolder();
      } else {
        app.dock?.hide();
      }
    } else {
      app.disableHardwareAcceleration();
    }
  }

  async createWindow() {
    await this.windowCreator.init();
  }
  onReady() {
    const readyFunction = async () => {
      checkVersion();
      await localConfig.init();
      await winPosition.load();
      const config = await localConfig.getConfig();
      if (!config.perf.common.guide) {
        guide().init();
        config.perf.common.guide = true;
        localConfig.setConfig(config);
      }
      await this.createWindow();
      const mainWindow = this.windowCreator.getWindow();
      API.init(mainWindow);
      if (!app.getLoginItemSettings().wasOpenedAtLogin) {
        mainWindow.show();
      }
      createTray(this.windowCreator.getWindow());
      registerHotKey(this.windowCreator.getWindow());
      this.systemPlugins.triggerReadyHooks(
        Object.assign(electron, {
          mainWindow: this.windowCreator.getWindow(),
          API,
        }),
      );
    };
    if (!app.isReady()) {
      app.on('ready', readyFunction);
    } else {
      readyFunction();
    }
  }

  onRunning() {
    app.on('second-instance', async (event, commandLine, workingDirectory) => {
      const files = getSearchFiles(commandLine, workingDirectory);
      let win = this.windowCreator.getWindow();
      if (!win) {
        await this.createWindow();
        win = this.windowCreator.getWindow();
      }
      if (!win) return;
      // 当运行第二个实例时,将会聚焦到myWindow这个窗口
      // 如果有文件列表作为参数，说明是命令行启动
      if (win.isMinimized()) {
        win.restore();
      }
      if (files.length > 0) {
        putFileToRubick(win.webContents, files);
      }
      win.show();
      win.focus();
    });
    app.on('activate', async () => {
      if (!this.windowCreator.getWindow()) {
        await this.createWindow();
      }
      const win = this.windowCreator.getWindow();
      win.show();
      win.focus();
    });
    if (commonConst.windows()) {
      // app.setAppUserModelId(pkg.build.appId)
    }
  }

  onQuit() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });

    if (commonConst.dev()) {
      if (process.platform === 'win32') {
        process.on('message', (data) => {
          if (data === 'graceful-exit') {
            app.quit();
          }
        });
      } else {
        process.on('SIGTERM', () => {
          app.quit();
        });
      }
    }
  }
}

export default new App();
