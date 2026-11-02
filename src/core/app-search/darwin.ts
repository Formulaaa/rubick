import fs from 'fs';
import os from 'os';
import path from 'path';
import getMacApps from './get-mac-app';

const userDataDir =
  typeof window !== 'undefined' && window.rubick?.getPath
    ? window.rubick.getPath('userData')
    : os.tmpdir();
const icondir = path.join(userDataDir, 'ProcessIcon');

if (!fs.existsSync(icondir)) {
  fs.mkdirSync(icondir, { recursive: true });
}

function hasValidIcon(iconPath: string) {
  try {
    const stat = fs.statSync(iconPath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

const isZhRegex = /[\u4e00-\u9fa5]/;

async function getAppIcon(appPath: string, nativeImage: any, name: string) {
  try {
    const safeName = String(name).replace(/[/\\]/g, '_');
    const iconpath = path.join(icondir, `${safeName}.png`);
    if (hasValidIcon(iconpath)) return true;

    // A previous run may have left an empty/partial PNG behind.
    if (fs.existsSync(iconpath)) {
      try {
        fs.unlinkSync(iconpath);
      } catch {
        // Ignore and let sips overwrite it if possible.
      }
    }

    await getMacApps.app2png(appPath, iconpath);
    return hasValidIcon(iconpath);
  } catch (e) {
    return false;
  }
}

export default async (nativeImage: any) => {
  let apps: any = await getMacApps.getApps();

  apps = apps.filter((app: any) => {
    const extname = path.extname(app.path);
    return extname === '.app' || extname === '.prefPane';
  });
  for (const app of apps) {
    if (await getAppIcon(app.path, nativeImage, app._name)) {
      const iconName = String(app._name).replace(/[/\\]/g, '_');
      app.icon =
        'image://' + path.join(icondir, `${encodeURIComponent(iconName)}.png`);
    } else {
      // app2png/sips occasionally fails for system apps (for example Finder).
      // Electron's native icon API is a reliable last resort.
      try {
        app.icon = window.rubick?.getFileIcon?.(app.path);
      } catch {
        // Keep the app in the list only when we have a usable icon.
      }
    }
    // todo getApp size
  }
  apps = apps.filter((app: any) => !!app.icon);

  apps = apps.map((app: any) => {
    const appName: any = app.path.split('/').pop();
    const extname = path.extname(appName);
    const appSubStr = appName.split(extname)[0];
    let fileOptions = {
      ...app,
      value: 'plugin',
      desc: app.path,
      pluginType: 'app',
      action: `open ${app.path.replace(/ /g, '\\ ') as string}`,
      keyWords: [appSubStr],
    };

    if (app._name && isZhRegex.test(app._name)) {
      // const [, pinyinArr] = translate(app._name);
      // const firstLatter = pinyinArr.map((py) => py[0]);
      // // 拼音
      // fileOptions.keyWords.push(pinyinArr.join(''));
      // // 缩写
      // fileOptions.keyWords.push(firstLatter.join(''));
      // 中文
      fileOptions.keyWords.push(app._name);
    }

    fileOptions = {
      ...fileOptions,
      name: app._name,
      names: JSON.parse(JSON.stringify(fileOptions.keyWords)),
    };
    return fileOptions;
  });

  return apps;
};
