import * as React from 'react';
import { logger } from '@freik/simplelogger';

import Store from './MyStore';
import { ConfigureIPC } from './Handler';

import type { IpcRenderer } from 'electron';
import type { PromiseIpcRenderer } from 'electron-promise-ipc/build/renderer';
import type { RendererProcessIpc } from '@freik/electron-better-ipc';

const log = logger.bind('async');
logger.disable('async');

declare type listenerFunc = (value: unknown) => void;
declare type subFunc = (key: string, listener: listenerFunc) => string;
declare type unsubFunc = (key: string, id: string) => boolean;

declare interface MyIpcRenderer extends IpcRenderer {
  promiseSub: subFunc;
  promiseUnsub: unsubFunc;
}

export interface MyWindow extends Window {
  ipc: MyIpcRenderer | undefined;
  remote: Electron.Remote | undefined;
  isDev: boolean | undefined;
  initApp: undefined | (() => void);
  ipcPromise: PromiseIpcRenderer | undefined;
  ipcSet: boolean | undefined;
  betterIpc: RendererProcessIpc | undefined;
}
declare let window: MyWindow;

// This is a react component to enable the IPC subsystem to talk to the store
// It uses a hook to get the store, then passes that on to the IPC subsystem
// It's not clear to me if this forces any sort of re-rendering  :/ ?
export default function AsyncDoodad(): JSX.Element {
  const store = Store.useStore();
  // Store subscription change notifications go here
  if (!window.ipc) {
    log('No IPC');
  } else if (!window.ipcSet) {
    log('IPC initialized');
    window.ipcSet = true;
    ConfigureIPC(store);
  }

  // Invisible, because this is just for listening to the main process
  return <div id="async-doodad" style={{ display: 'none' }} />;
}
