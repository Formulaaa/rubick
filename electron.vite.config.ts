import { builtinModules, createRequire } from 'node:module';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import type { Plugin } from 'vite';

const nodeRequire = createRequire(import.meta.url);
const IDENTIFIER_RE = /^[$A-Z_][0-9A-Z_$]*$/i;
const RESERVED_WORDS = new Set([
  'arguments',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);
const VIRTUAL_PREFIX = '\0rubick-shim:';

const shimmedModules = new Set([
  'electron',
  '@electron/remote',
  'original-fs',
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  'axios',
  'cross-spawn',
  'fix-path',
  'fs-extra',
  'get-mac-apps',
  'got',
  'lodash.debounce',
  'pinyin-match',
  'plist',
  'simple-plist',
]);

// 通过间接引用 require，避免 Rolldown 在构建期把 shim 自身解析成循环依赖
const REQUIRE_BOOTSTRAP = `const _req_ = (() => { const r = require; return r; })();`;

const electronShim = `${REQUIRE_BOOTSTRAP}
const m = _req_('electron');
export default m;
export const app = m.app;
export const BrowserWindow = m.BrowserWindow;
export const clipboard = m.clipboard;
export const ClipboardItem = m.ClipboardItem;
export const contextBridge = m.contextBridge;
export const crashReporter = m.crashReporter;
export const dialog = m.dialog;
export const ipcMain = m.ipcMain;
export const ipcRenderer = m.ipcRenderer;
export const Menu = m.Menu;
export const nativeImage = m.nativeImage;
export const nativeTheme = m.nativeTheme;
export const Notification = m.Notification;
export const protocol = m.protocol;
export const screen = m.screen;
export const session = m.session;
export const shell = m.shell;
export const Tray = m.Tray;
export const webFrame = m.webFrame;
export const webUtils = m.webUtils;
`;

const remoteShim = `${REQUIRE_BOOTSTRAP}
const m = _req_('@electron/remote');
export default m;
export const app = m.app;
export const BrowserWindow = m.BrowserWindow;
export const getGlobal = m.getGlobal;
export const Menu = m.Menu;
export const nativeTheme = m.nativeTheme;
export const screen = m.screen;
`;

const originalFsShim = `${REQUIRE_BOOTSTRAP}
const m = _req_('original-fs');
export default m;
export const existsSync = m.existsSync;
export const lstatSync = m.lstatSync;
export const statSync = m.statSync;
`;

const cjsShim = (id: string) => {
  let keys: string[] = [];
  try {
    const mod = nodeRequire(id);
    keys = Object.getOwnPropertyNames(mod ?? {}).filter(
      (key) =>
        key !== 'default' &&
        key !== '__esModule' &&
        IDENTIFIER_RE.test(key) &&
        !RESERVED_WORDS.has(key),
    );
  } catch {
    // 运行时可能仍可 require，退化为默认导出
  }
  const named = keys
    .map((key) => `export const ${key} = _m_[${JSON.stringify(key)}];`)
    .join('\n');
  return `${REQUIRE_BOOTSTRAP}
const _m_ = _req_(${JSON.stringify(id)});
export default (_m_?.default ?? _m_);
${named}
`;
};

/**
 * 渲染进程开启了 nodeIntegration，这里把所有 Node/Electron/CJS 依赖
 * 统一 shim 成运行时 require，避免 Vite/Rolldown 在浏览器环境下外部化后
 * 留下无法解析的裸 import。
 */
const electronRendererShim = (): Plugin => ({
  name: 'rubick-electron-renderer-shim',
  enforce: 'pre',
  resolveId(id) {
    if (shimmedModules.has(id)) return VIRTUAL_PREFIX + id;
    return null;
  },
  load(id) {
    if (!id.startsWith(VIRTUAL_PREFIX)) return null;
    const target = id.slice(VIRTUAL_PREFIX.length);
    if (target === 'electron') return electronShim;
    if (target === '@electron/remote') return remoteShim;
    if (target === 'original-fs') return originalFsShim;
    return cjsShim(target);
  },
});

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        input: resolve('src/main/index.ts'),
        external: ['original-fs'],
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          preload: resolve('public/preload.js'),
          'feature-preload': resolve('feature/public/preload.js'),
        },
      },
    },
  },
  renderer: {
    root: resolve('src/renderer'),
    publicDir: false,
    resolve: {
      extensions: [
        '.mjs',
        '.js',
        '.mts',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.vue',
      ],
      alias: {
        '@': resolve('src'),
        '~': resolve('src'),
      },
    },
    plugins: [vue(), electronRendererShim(), tailwindcss()],
    build: {
      sourcemap: true,
      rollupOptions: {
        input: resolve('src/renderer/index.html'),
      },
    },
    server: {
      port: 5173,
    },
  },
});
