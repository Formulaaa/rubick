import { exec, execFile } from 'child_process';
import { clipboard, Notification } from 'electron';
import fs from 'fs';
import path from 'path';
import { readClipboardImage } from '@/common/utils/clipboard';
import platform from '@/common/utils/commonConst';
import staticPath from '@/main/common/staticPath';

const emitClipboardImage = async (cb) => {
  const image = await readClipboardImage();
  cb && cb(image ? image.toDataURL() : '');
};

// 截图方法windows
export const screenWindow = (cb) => {
  const url = path.resolve(staticPath, 'ScreenCapture.exe');
  const unpacked = url.replace('app.asar', 'app.asar.unpacked');
  const target = fs.existsSync(unpacked) ? unpacked : url;
  const screen_window = execFile(target);
  screen_window.on('exit', (code) => {
    if (code) {
      void emitClipboardImage(cb);
    }
  });
};

// 截图方法mac
export const handleScreenShots = (cb) => {
  exec('screencapture -i -r -c', () => {
    void emitClipboardImage(cb);
  });
};

export default (mainWindow, cb) => {
  // 接收到截图后的执行程序
  void clipboard.writeText('');
  if (platform.macOS()) {
    handleScreenShots(cb);
  } else if (platform.windows()) {
    screenWindow(cb);
  } else {
    new Notification({
      title: '兼容性支持度不够',
      body: 'Linux 系统截图暂不支持，我们将会尽快更新！',
    }).show();
  }
};
