import { screen } from 'electron';
import debounce from 'lodash.debounce';
import { WINDOW_WIDTH } from '@/common/constans/common';
import localConfig from './initLocalConfig';

type WindowPosition = {
  x: number;
  y: number;
  displayId: number;
};

// 默认位置：水平居中，垂直位于工作区中上部
const DEFAULT_TOP_RATIO = 0.2;
const SAVE_DELAY = 400;

let position: WindowPosition | null = null;

const getDefaultPosition = (
  display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()),
): WindowPosition => {
  const { workArea } = display;
  return {
    x: Math.round(workArea.x + workArea.width / 2 - WINDOW_WIDTH / 2),
    y: Math.round(workArea.y + workArea.height * DEFAULT_TOP_RATIO),
    displayId: display.id,
  };
};

const isPositionVisible = (target: WindowPosition): boolean => {
  return screen.getAllDisplays().some((display) => {
    const { x, y, width, height } = display.workArea;
    return (
      target.x >= x &&
      target.x < x + width &&
      target.y >= y &&
      target.y < y + height
    );
  });
};

const persistPosition = debounce(async () => {
  if (!position) return;
  const config = await localConfig.getConfig();
  await localConfig.setConfig({
    perf: {
      ...config.perf,
      window: { ...position },
    },
  });
}, SAVE_DELAY);

const winPosition = {
  async load(): Promise<void> {
    const config = await localConfig.getConfig();
    const saved = config?.perf?.window as WindowPosition | undefined;
    if (!saved || typeof saved.x !== 'number' || typeof saved.y !== 'number') {
      position = null;
      return;
    }
    const target = {
      x: saved.x,
      y: saved.y,
      displayId: saved.displayId,
    };
    if (!isPositionVisible(target)) {
      position = null;
      return;
    }
    position = target;
  },

  getPosition(): { x: number; y: number } {
    const cursorDisplay = screen.getDisplayNearestPoint(
      screen.getCursorScreenPoint(),
    );
    if (
      position &&
      isPositionVisible(position) &&
      position.displayId === cursorDisplay.id
    ) {
      return { x: position.x, y: position.y };
    }

    // 首次启动、切换显示器、分辨率变化或位置超出可见区域时回退默认位置
    position = getDefaultPosition(cursorDisplay);
    persistPosition();
    return { x: position.x, y: position.y };
  },

  setPosition(x: number, y: number): void {
    const display = screen.getDisplayNearestPoint({ x, y });
    position = { x, y, displayId: display.id };
    persistPosition();
  },

  reset(): { x: number; y: number } {
    position = getDefaultPosition(
      screen.getDisplayNearestPoint(screen.getCursorScreenPoint()),
    );
    persistPosition();
    return { x: position.x, y: position.y };
  },
};

export default winPosition;
