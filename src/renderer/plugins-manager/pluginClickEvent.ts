import path from 'path';
import { toRaw } from 'vue';
import { PLUGIN_INSTALL_DIR as baseDir } from '@/common/constans/renderer';
import commonConst from '@/common/utils/commonConst';

const { pathToFileURL } = window.require('url');

export default function pluginClickEvent({
  plugin,
  fe,
  cmd,
  ext,
  openPlugin,
  option,
}) {
  const pluginPath = path.resolve(baseDir, 'node_modules', plugin.name);
  const pluginDist = {
    ...toRaw(plugin),
    indexPath: pathToFileURL(path.join(pluginPath, './', plugin.main || ''))
      .href,
    cmd: cmd.label || cmd,
    feature: fe,
    ext,
  };
  // 模板文件
  if (!plugin.main) {
    pluginDist.tplPath = commonConst.dev()
      ? 'http://localhost:8083/#/'
      : pathToFileURL(path.join(window.__static, 'tpl/index.html')).href;
  }
  // 插件市场
  if (plugin.name === 'rubick-system-feature') {
    pluginDist.indexPath = commonConst.dev()
      ? 'http://localhost:8081/#/'
      : pathToFileURL(path.join(window.__static, 'feature/index.html')).href;
  }
  openPlugin(pluginDist, option);
}
