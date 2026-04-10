import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const serveMain = require.resolve('serve/build/main.js');
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const port = process.env.PORT ?? '3000';

const child = spawn(
  process.execPath,
  [serveMain, '-s', 'dist', '-l', `tcp://0.0.0.0:${port}`],
  { cwd: projectRoot, stdio: 'inherit' }
);

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
