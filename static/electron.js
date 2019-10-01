// @flow

const { app, ipcMain } = require('electron');
const path = require('path');

const persist = require('./persist');
const setup = require('./electronSetup');
const music = require('./music');

import type { BrowserWindow } from 'electron';
import type { OnWindowCreated } from './electronSetup';
import type { MusicDB } from './music';

let musicDB: ?MusicDB;

const init = async () => {
  // Check to see if we have any locations to start with
  // If not, start with the "music" location and see what we can find...
  musicDB = persist.getItem('DB');
  if (!musicDB) {
    let musicLocations = persist.getItem('locations');
    if (!musicLocations) {
      musicLocations = [app.getPath('music')];
      persist.setItem('locations', musicLocations);
    }
    musicDB = await music.find(musicLocations);

    // I wonder how big this winds up being :/
    persist.setItem('DB', musicDB);
  } else {
    // TODO: Rescan source locations
  }
};

const onWindowCreated: OnWindowCreated = (window: BrowserWindow): void => {
  window.webContents.send('asynchronous-message', 'loading');
  // Initialize stuff now
  init()
    .then(() => {
      window.webContents.send(
        'asynchronous-message',
        `ready:${musicDB.songs.length}`
      );
      console.log(musicDB);
    })
    .catch(e => {
      console.error(e);
      window.webContents.send('asynchronous-message', 'error:loading');
    });
};

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log('Received async message:');
  console.log(event);
  console.log(`arg: ${arg}`);
  event.sender.send('asynchronous-reply', 'pong');
});

ipcMain.on('synchronous-message', (event, arg) => {
  console.log('Received sync message');
  console.log(event);
  console.log(`arg: ${arg}`);
  event.returnValue = 'pong';
});

setup(onWindowCreated);