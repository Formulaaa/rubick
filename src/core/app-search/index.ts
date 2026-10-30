import commonConst from '@/common/utils/commonConst';
import darwin from './darwin';
import linux from './linux';
import win from './win';

let appSearch;

if (commonConst.macOS()) {
  appSearch = darwin;
} else if (commonConst.windows()) {
  appSearch = win;
} else if (commonConst.linux()) {
  appSearch = linux;
}

export default appSearch;
