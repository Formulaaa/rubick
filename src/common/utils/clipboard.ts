import type { NativeImage } from 'electron';

/**
 * Electron 45 起渲染进程不再暴露 clipboard / ClipboardItem。
 * 这里统一从主进程（主进程直接 require，渲染进程通过 @electron/remote）获取。
 */
const electronModule = (() => {
  if (typeof window !== 'undefined' && (window as any).require) {
    try {
      const remote = (window as any).require('@electron/remote');
      return remote.require('electron');
    } catch {
      // fall through
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('electron');
})();

const clipboard = electronModule.clipboard;
const ClipboardItem = electronModule.ClipboardItem;
const nativeImage = electronModule.nativeImage;

export const rawFormat = (name: string) =>
  `electron application/osclipboard;format="${name}"`;

const isBlob = (value: any): value is Blob =>
  !!value &&
  typeof value === 'object' &&
  typeof value.text === 'function' &&
  typeof value.arrayBuffer === 'function';

const toBlob = (value: Buffer | string | Blob): Blob => {
  if (isBlob(value)) return value;
  if (typeof value === 'string') return new Blob([value]);
  return new Blob([new Uint8Array(value)]);
};

async function findValue(mime: string): Promise<any | null> {
  const items = await clipboard.read();
  for (const item of items) {
    if (!item.types.includes(mime)) continue;
    return await item.getType(mime as any);
  }
  return null;
}

export async function readClipboardType(mime: string): Promise<string | null> {
  const value = await findValue(mime);
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (isBlob(value)) return value.text();
  if (typeof value === 'object') return JSON.stringify(value);
  return null;
}

export async function readClipboardBuffer(
  mime: string,
): Promise<Buffer | null> {
  const value = await findValue(mime);
  if (value === null || value === undefined) return null;
  if (isBlob(value)) {
    return Buffer.from(await value.arrayBuffer());
  }
  if (typeof value === 'string') return Buffer.from(value, 'utf8');
  return null;
}

export async function readRawFormat(name: string): Promise<string | null> {
  return readClipboardType(rawFormat(name));
}

export async function readRawBuffer(name: string): Promise<Buffer | null> {
  return readClipboardBuffer(rawFormat(name));
}

export async function writeClipboardItems(
  fields: Record<string, Buffer | string | Blob>,
): Promise<void> {
  const payload: Record<string, any> = {};
  for (const [mime, value] of Object.entries(fields)) {
    payload[mime] = toBlob(value);
  }
  await clipboard.write([new ClipboardItem(payload)]);
}

export async function writeRawFormat(
  name: string,
  value: Buffer | string,
): Promise<void> {
  await writeClipboardItems({ [rawFormat(name)]: value });
}

export async function getClipboardFormats(): Promise<string[]> {
  const items = await clipboard.read();
  return Array.from(new Set(items.flatMap((item) => item.types)));
}

export async function readClipboardImage(): Promise<NativeImage | null> {
  const items = await clipboard.read();
  for (const item of items) {
    const type = item.types.find((mime) => mime.startsWith('image/'));
    if (!type) continue;
    const value: any = await item.getType(type as any);
    if (!isBlob(value)) continue;
    const image = nativeImage.createFromBuffer(
      Buffer.from(await value.arrayBuffer()),
    );
    if (!image.isEmpty()) return image;
  }
  return null;
}

export async function writeClipboardImage(image: NativeImage): Promise<void> {
  await writeClipboardItems({ 'image/png': image.toPNG() });
}

export async function readClipboardText(): Promise<string> {
  return clipboard.readText();
}

export async function writeClipboardText(text: string): Promise<void> {
  await clipboard.writeText(text);
}

export function clearClipboard(): void {
  clipboard.clear();
}
