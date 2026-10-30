import fs from 'fs';
import ofs from 'original-fs';
import path from 'path';
import plist from 'plist';
import { readClipboardType, readRawFormat } from './clipboard';
import commonConst from './commonConst';
import runtimeRequire from './runtimeRequire';

const parseUriList = (text: string): string[] => {
  const matches = text.match(/^file:\/\/\/.*/gm) || [];
  return matches.map((item) =>
    decodeURIComponent(item).replace(/^file:\/\//, ''),
  );
};

export default async function getCopyFiles(): Promise<Array<any> | null> {
  let fileInfo;
  if (commonConst.macOS()) {
    const raw = await readRawFormat('NSFilenamesPboardType');
    if (raw) {
      try {
        fileInfo = plist.parse(raw);
      } catch (e) {
        return null;
      }
    } else {
      const uriList = await readClipboardType('text/uri-list');
      if (!uriList) return null;
      fileInfo = parseUriList(uriList);
    }
  } else if (process.platform === 'win32') {
    try {
      const clipboardEx = runtimeRequire('electron-clipboard-ex');
      fileInfo = clipboardEx.readFilePaths();
    } catch (e) {
      // todo
    }
  } else {
    if (!commonConst.linux()) return null;
    const uriList = await readClipboardType('text/uri-list');
    if (!uriList) return null;
    fileInfo = parseUriList(uriList);
  }
  if (!Array.isArray(fileInfo)) return null;
  const target: any = fileInfo
    .map((p) => {
      if (!fs.existsSync(p)) return false;
      let info;
      try {
        info = ofs.lstatSync(p);
      } catch (e) {
        return false;
      }
      return {
        isFile: info.isFile(),
        isDirectory: info.isDirectory(),
        name: path.basename(p) || p,
        path: p,
      };
    })
    .filter(Boolean);
  return target.length ? target : null;
}
