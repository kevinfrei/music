// This is for getting at "global" stuff from the window object
import { SeqNum, Logger } from '@freik/core-utils';
import { IpcRendererEvent, OpenDialogSyncOptions } from 'electron/main';

import type { IpcRenderer } from 'electron';
import type { RendererProcessIpc } from '@freik/electron-better-ipc';
import type { SongKey } from './MyStore';

const log = Logger.bind('MyWindow');
// Logger.enable('MyWindow');

declare type ListenerFunc = (value: unknown) => void;
declare type SubFunc = (key: string, listener: ListenerFunc) => string;
declare type UnsubFunc = (key: string, id: string) => boolean;
declare type ListenerType = Map<string, (val: string) => void>;
export type KeyValue = {
  key: string;
  value: unknown;
};
export declare type RemoteDataTypes = SongKey[] &
  string &
  Map<string, SongKey[]> &
  number &
  boolean;

declare interface MyIpcRenderer extends IpcRenderer {
  promiseSub: SubFunc;
  promiseUnsub: UnsubFunc;
}

interface MyWindow extends Window {
  ipc: MyIpcRenderer | undefined;
  remote: Electron.Remote | undefined;
  isDev: boolean | undefined;
  initApp: undefined | (() => void);
  // ipcPromise: PromiseIpcRenderer | undefined;
  ipcSet: boolean | undefined;
  betterIpc: RendererProcessIpc | undefined;
}

declare let window: MyWindow;

// The basics (I never want to use window directly, I think...
export function SetTimeout(handler: () => any, timeout?: number): number {
  return window.setTimeout(handler, timeout);
}

export function ClearTimeout(handle?: number): void {
  window.clearTimeout(handle);
}

let posIntervalId: number | undefined;
export function ConfigurePositionInterval(
  func: () => void,
  time: number,
): void {
  // eslint-disable-next-line id-blacklist
  if (posIntervalId !== undefined) {
    window.clearInterval(posIntervalId);
  }
  posIntervalId = window.setInterval(func, time);
}

export function ShowOpenDialog(
  options: OpenDialogSyncOptions,
): string[] | undefined {
  return window.remote!.dialog.showOpenDialogSync(options);
}

export function SetInit(func: () => void): void {
  window.initApp = func;
}

export function InitialWireUp(): void {
  if (window.betterIpc && !window.ipcSet) {
    window.ipcSet = true;
    SetPromiseFuncs();
  }
}

export function IpcSend(channel: string, ...args: any[]): void {
  window.ipc!.send(channel, ...args);
}
export function IpcOn(
  channel: string,
  listener: (event: IpcRendererEvent, ...args: any[]) => void,
): void {
  window.ipc!.on(channel, listener);
}

export function PromiseSubscribe(key: string, listener: ListenerFunc): string {
  return window.ipc!.promiseSub(key, listener);
}

export function PromiseUnsubscribe(key: string, id: string): void {
  window.ipc!.promiseUnsub(key, id);
}
/*
export async function PromiseSend(
  cmd: string,
  obj: { key: string; value?: unknown },
): Promise<unknown> {
  return window.ipcPromise!.send(cmd, obj);
}
*/

export function CallMain<Type, Result>(
  channel: string,
  key?: Type,
): Promise<Result | void> {
  return window.betterIpc!.callMain<Type, Result>(channel, key);
}

// eslint-disable-next-line
const listeners: Map<string, ListenerType> = new Map<string, ListenerType>();
const subIds = SeqNum();

export function SetPromiseFuncs(): void {
  window.ipc!.promiseSub = (
    key: string,
    listener: (value: string) => void,
  ): string => {
    let subs = listeners.get(key);
    if (!subs) {
      subs = new Map();
      log(`Starting to listen for ${key}`);
    }
    const id = subIds();
    subs.set(id, listener);
    listeners.set(key, subs);
    return id;
  };
  window.ipc!.promiseUnsub = (key: string, id: string): boolean => {
    const subs = listeners.get(key);
    if (!subs) {
      return false;
    }
    const res = subs.delete(id);
    listeners.set(key, subs);
    return res;
  };
  window.ipc!.on(
    'promise-response',
    (event: Event, data: { key: string; value: RemoteDataTypes }) => {
      log(`Got a response for ${data.key}:`);
      log(data);
      const localSubscribers = listeners.get(data.key);
      if (localSubscribers) {
        for (const fn of localSubscribers.values()) {
          fn(data.value);
        }
      }
    },
  );
}