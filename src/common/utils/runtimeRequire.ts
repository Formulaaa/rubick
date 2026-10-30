/**
 * 运行时 require：渲染进程可用 window.require，主进程回退到 Node require。
 * 使用变量参数可以避免打包器静态解析原生模块 / 平台专属模块。
 */
export default function runtimeRequire(id: string): any {
  const globalRequire =
    typeof window !== 'undefined' ? (window as any).require : undefined;
  if (typeof globalRequire === 'function') return globalRequire(id);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(id);
}
