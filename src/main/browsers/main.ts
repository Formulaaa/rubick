import { BrowserWindow, nativeTheme, protocol } from 'electron';
import path from 'path';
import {
  WINDOW_HEIGHT,
  WINDOW_MIN_HEIGHT,
  WINDOW_WIDTH,
} from '@/common/constans/common';
// import versonHandler from '../common/versionHandler';
import localConfig from '@/main/common/initLocalConfig';
import winPosition from '../common/getWinPosition';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('@electron/remote/main').initialize();

export default () => {
  let win: any;

  const init = async () => {
    await createWindow();
  };

  const createWindow = async () => {
    const config = await localConfig.getConfig();
    const isDark =
      config?.perf?.common?.darkMode ?? nativeTheme.shouldUseDarkColors;
    win = new BrowserWindow({
      height: WINDOW_HEIGHT,
      minHeight: WINDOW_MIN_HEIGHT,
      useContentSize: true,
      resizable: true,
      width: WINDOW_WIDTH,
      frame: false,
      title: '拉比克',
      show: false,
      skipTaskbar: true,
      backgroundColor: isDark ? '#1c1c28' : '#fff',
      webPreferences: {
        webSecurity: false,
        backgroundThrottling: false,
        contextIsolation: false,
        webviewTag: true,
        nodeIntegration: true,
        preload: path.join(__dirname, '../preload/preload.js'),
        spellcheck: false,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@electron/remote/main').enable(win.webContents);
    const { x, y } = winPosition.getPosition();
    win.setPosition(x, y);
    if (process.env.ELECTRON_RENDERER_URL) {
      // Load the url of the dev server if in development mode
      win.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
      win.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
    protocol.interceptFileProtocol('image', (req, callback) => {
      const url = req.url.substr(8);
      callback(decodeURI(url));
    });
    win.on('closed', () => {
      win = undefined;
    });

    win.on('show', () => {
      // 触发主窗口的 onShow hook
      win.webContents.executeJavaScript(
        `window.rubick && window.rubick.hooks && typeof window.rubick.hooks.onShow === "function" && window.rubick.hooks.onShow()`,
      );
      // versonHandler.checkUpdate();
      // win.webContents.openDevTools();
    });

    win.on('hide', () => {
      // 触发主窗口的 onHide hook
      win.webContents.executeJavaScript(
        `window.rubick && window.rubick.hooks && typeof window.rubick.hooks.onHide === "function" && window.rubick.hooks.onHide()`,
      );
    });

    // 判断失焦是否隐藏
    win.on('blur', async () => {
      const config = await localConfig.getConfig();
      if (config.perf.common.hideOnBlur) {
        win.hide();
      }
    });
  };

  const getWindow = () => win;

  return {
    init,
    getWindow,
  };
};
