import { spawn } from 'node:child_process';

const commands = [
  ['feature', 'pnpm', ['--filter', 'feature', 'dev']],
  ['tpl', 'pnpm', ['--filter', 'tpl', 'dev']],
  ['detach', 'pnpm', ['--filter', 'detach', 'dev']],
  ['guide', 'pnpm', ['--filter', 'guide', 'dev']],
  ['electron', 'pnpm', ['exec', 'electron-vite', 'dev']],
];

const children = [];
let shuttingDown = false;

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.killed || !child.pid) continue;
    try {
      if (process.platform === 'win32') {
        child.kill('SIGTERM');
      } else {
        process.kill(-child.pid, 'SIGTERM');
      }
    } catch {}
  }
  setTimeout(() => process.exit(code), 200);
};

for (const [name, command, args] of commands) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    detached: process.platform !== 'win32',
  });
  children.push(child);
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    if (signal || code) {
      console.error(`[dev] ${name} exited`, { code, signal });
      shutdown(code || 1);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
