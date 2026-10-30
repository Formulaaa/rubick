import path from 'node:path';
import { app } from 'electron';

const staticPath = app.isPackaged
  ? path.join(app.getAppPath(), 'public')
  : path.join(__dirname, '../../public');

export default staticPath;
