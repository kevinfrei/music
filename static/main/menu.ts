import { FTONObject, MakeError, MakeLogger, Type } from '@freik/core-utils';
import {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
} from 'electron';
import { KeyboardEvent } from 'electron/main';
import open from 'open';
import { asyncSend } from './Communication';
import * as persist from './persist';
import { toggleMiniPlayer } from './window';

// import isDev from 'electron-is-dev';
const isDev = true;

const log = MakeLogger('menu', isDev);
const err = MakeError('menu-err'); // eslint-disable-line

type ClickHandler = (
  mnu?: MenuItem,
  wnd?: BrowserWindow | undefined,
  event?: KeyboardEvent,
) => void;

const isMac = process.platform === 'darwin';

// eslint-disable-next-line
const ___: MenuItemConstructorOptions = { type: 'separator' };

function getClick(handler?: ClickHandler | FTONObject) {
  if (!handler) {
    return;
  }
  if (Type.isFunction(handler)) {
    return handler;
  }
  return () => {
    void asyncSend({ menuAction: handler });
  };
}

function getId(lbl: string) {
  return lbl.replace('&', '').toLocaleLowerCase();
}

// TODO: Add an action to be taken, with a quick x-plat shortcut key
function xaction(
  label: string,
  accelerator: string,
  handler?: ClickHandler | FTONObject,
): MenuItemConstructorOptions {
  return {
    label,
    id: getId(label),
    accelerator: `CmdOrCtrl+${accelerator}`,
    click: getClick(handler),
  };
}

// Typescript Method Overloading is kinda weird...
function action(
  label: string,
  accOrHdlr: string | ClickHandler | FTONObject | void,
  handler?: ClickHandler | FTONObject,
): MenuItemConstructorOptions {
  if (Type.isString(accOrHdlr)) {
    return {
      label,
      id: getId(label),
      accelerator: accOrHdlr,
      click: getClick(handler),
    };
  } else if (!accOrHdlr) {
    return { label, id: getId(label) };
  } else {
    return { label, id: getId(label), click: getClick(accOrHdlr) };
  }
}

export function makeMainMenu(): void {
  const appMenu: MenuItemConstructorOptions = {
    role: 'appMenu',
    label: app.name,
    submenu: [
      { role: 'about' },
      ___,
      { role: 'services' },
      ___,
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      ___,
      { role: 'quit' },
    ],
  };

  const fileMenu: MenuItemConstructorOptions = {
    role: 'fileMenu',
    label: '&File',
    submenu: [
      xaction('Add F&ile Location', 'O', { state: 'addLocation' }),
      ___,
      isMac ? { role: 'close' } : { role: 'quit' },
    ],
  };

  const editMenu: MenuItemConstructorOptions = {
    role: 'editMenu',
    label: '&Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      ___,
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
      ___,
      xaction('F&ind', 'F', { state: 'find' }),
    ],
  };
  const viewMenu: MenuItemConstructorOptions = {
    label: '&View',
    submenu: [
      xaction('&Now Playing', '1', { state: 'view', select: 'NowPlaying' }),
      ___,
      xaction('A&lbums', '2', { state: 'view', select: 'Albums' }),
      xaction('A&rtists', '3', { state: 'view', select: 'Artists' }),
      xaction('&Songs', '4', { state: 'view', select: 'Songs' }),
      xaction('&Playlists', '5', { state: 'view', select: 'Playlists' }),
      xaction('Se&ttings', ',', { state: 'view', select: 'Settings' }),
      ___,
      xaction('M&iniPlayer', '9', toggleMiniPlayer),
    ],
  };
  const mediaMenu: MenuItemConstructorOptions = {
    label: '&Media',
    submenu: [
      xaction('Pla&y', 'P', { state: 'playback' }),
      xaction('Pre&vious Track', 'Left', { state: 'prevTrack' }),
      xaction('Ne&xt Track', 'Right', { state: 'nextTrack' }),
      ___,
      xaction('Skip &Forward 10s', ']', { state: 'fwd' }),
      xaction('Skip &Back 10s', '[', { state: 'back' }),
      ___,
      {
        ...xaction('&Shuffle', 'S', { state: 'shuffle' }),
        type: 'checkbox',
      },
      {
        ...xaction('&Repeat', 'T', { state: 'repeat' }),
        type: 'checkbox',
      },
      ___,
      action('&Mute', { state: 'mute' }),
      action('Volume &Up', { state: 'louder' }),
      action('Volume &Down', { state: 'quieter' }),
    ],
  };
  const windowMenu: MenuItemConstructorOptions = {
    role: 'windowMenu',
    label: '&Window',
    submenu: isMac
      ? [
          { role: 'minimize' },
          { role: 'zoom' },
          ___,
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          ___,
          { role: 'togglefullscreen' },
          ___,
          { role: 'front' },
        ]
      : [
          { role: 'minimize' },
          { role: 'zoom' },
          ___,
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          ___,
          { role: 'togglefullscreen' },
        ],
  };
  const helpItem: MenuItemConstructorOptions = action(
    `${app.name} help`,
    () => {
      log('HERE!');
      void open('https://github.com/kevinfrei/EMP/wiki');
    },
  );
  const helpMenu: MenuItemConstructorOptions = {
    //    role: 'help',
    label: '&Help',
    submenu: isMac ? [helpItem] : [helpItem, ___, { role: 'about' }],
  };
  const dbgMenu: MenuItemConstructorOptions = {
    label: '&Debug',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
    ],
  };

  const template: MenuItemConstructorOptions[] = [
    appMenu,
    fileMenu,
    editMenu,
    viewMenu,
    mediaMenu,
    windowMenu,
    helpMenu,
  ];
  if (!isMac) {
    // Rip off the appMenu for non-Mac
    template.shift();
  }
  if (isDev) {
    // Add the debug menu for dev-mode
    template.push(dbgMenu);
  }
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // TODO: Get the initial state working

  // This is the world's slowest way to respond to state changes :D
  persist.subscribe('repeat', (val: string) => {
    const itm = menu.getMenuItemById('repeat');
    if (itm) {
      itm.checked = val === 'true';
    }
  });
  persist.subscribe('shuffle', (val: string) => {
    const itm = menu.getMenuItemById('shuffle');
    if (itm) {
      itm.checked = val === 'true';
    }
  });
  persist.subscribe('CurrentView', (val: string) => {
    const views = [
      ['now playing', '6'],
      ['albums', '2'],
      ['artists', '3'],
      ['songs', '4'],
      ['playlists', '5'],
      ['settings', '7'],
    ].map(([id, idx]) => [menu.getMenuItemById(id), idx]);
    views.forEach(([mnu, idx]) => {
      (mnu as MenuItem).enabled = idx !== val;
    });
  });

  // Toggle mute/adjust vol up/dn
  persist.subscribe('volume', (val: string) => {
    const vol = Number.parseFloat(val);
    const up = menu.getMenuItemById('volume up');
    const dn = menu.getMenuItemById('volume down');
    if (up && dn) {
      up.enabled = vol < 1.0;
      dn.enabled = vol > 0.0;
    }
  });
  persist.subscribe('mute', (val: string) => {
    const itm = menu.getMenuItemById('mute');
    if (itm) {
      itm.label = val === 'true' ? 'Unm&ute' : 'M&ute';
    }
  });
}
