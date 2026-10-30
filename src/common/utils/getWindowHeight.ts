const WINDOW_MAX_HEIGHT = 620;
const WINDOW_MIN_HEIGHT = 60;
const PRE_ITEM_HEIGHT = 70;
const HOME_HEIGHT = 250;
const HOME_EMPTY_HEIGHT = 320;
const FOOTER_HEIGHT = 34;

export default (searchList: Array<any>, historyList): number => {
  if (!searchList) return WINDOW_MAX_HEIGHT;
  if (!searchList.length) {
    return historyList?.length ? HOME_HEIGHT : HOME_EMPTY_HEIGHT;
  }
  const target =
    searchList.length * PRE_ITEM_HEIGHT + WINDOW_MIN_HEIGHT + FOOTER_HEIGHT;
  return Math.min(target, WINDOW_MAX_HEIGHT);
};
