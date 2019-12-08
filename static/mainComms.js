// @flow
const logger = require('simplelogger');
const { BrowserWindow } = require('electron');

const persist = require('./persist');

const log = logger.bind('mainComms');
logger.disable('mainComms');

// This returns an array of object handlers

export type MessageHandler<T> = {
  command: string,
  validator: (val: string) => ?T,
  handler: (data: T) => void
};

export type KVP = {
  key: string,
  value: mixed
};

const kvpValidator = (val: string): ?KVP => {
  try {
    const res = JSON.parse(val);
    if (
      typeof res === 'object' &&
      res !== null &&
      res.hasOwnProperty('key') &&
      res.hasOwnProperty('value') &&
      typeof res.key === 'string'
    ) {
      return res;
    }
  } catch (e) {}
  return undefined;
};

const stringValidator = (val: string): ?string => val;

const setter = ({ key, value }: KVP) => {
  persist.setItem(key, JSON.stringify(value));
};

const deleter = (key: string) => {
  persist.deleteItem(key);
};

// Get a value from disk and sends {key:'key', value: ...value} in JSON
const getter = (key: string) => {
  try {
    const val = persist.getItem(key);
    if (typeof val !== 'string') {
      log(`getting ${key} results in non-string value:`);
      log(val);
      return;
    }
    log(`About to send {key:${key}, value:${val}}`);
    const value = JSON.parse(val);
    const allWnd: Array<BrowserWindow> = BrowserWindow.getAllWindows();
    log(`Window count: ${allWnd.length}`);
    const firstWnd = allWnd[0];
    log("Window:");
    log(firstWnd);
    const webCont = firstWnd.webContents;
    log("webContents");
    log(webCont);
    const message = JSON.stringify({key, value});
    log(`Sending data: ${message}`);
    webCont.send('data', message);
  } catch (e) {}
};

const mk = <T>(
  command: string,
  validator: (val: string) => ?T,
  handler: (data: T) => void
): MessageHandler<T> => ({ command, validator, handler });

module.exports = [
  mk<KVP>('set', kvpValidator, setter),
  mk<string>('delete', stringValidator, deleter),
  mk<string>('get', stringValidator, getter)
];
