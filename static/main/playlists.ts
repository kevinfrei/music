import {
  Comparisons,
  fromSafeName,
  FTON,
  MakeError,
  MakeLogger,
  SongKey,
  toSafeName,
  Type,
} from '@freik/core-utils';
import { exception } from 'console';
import { app } from 'electron';
import { promises as fsp } from 'fs';
import path from 'path';
import { getMusicDB } from './MusicAccess';
import * as persist from './persist';

const log = MakeLogger('playlists');
const err = MakeError('playlists-err');

function playlistDir(): string {
  return path.join(app.getPath('userData'), 'playlists');
}

function playlistName(file: string): string {
  return fromSafeName(file);
}

function playlistPath(name: string): string {
  return path.join(playlistDir(), toSafeName(name));
}

export async function renamePlaylist([curName, newName]: [
  string,
  string,
]): Promise<void> {
  log('renamePlaylist');
  try {
    await fsp.rename(playlistPath(curName), playlistPath(newName));
    log('Renamed successfully:');
  } catch (e) {
    err('Unable to rename playlist:');
    err(curName);
    err(newName);
    err(e);
  }
}

export async function deletePlaylist(data: string): Promise<void> {
  log('deletePlaylist');
  try {
    if (!data) throw exception('no data');
    await fsp.unlink(playlistPath(data));
    log('Deleted successfully:');
    log(data);
  } catch (e) {
    err('Unable to delete playlist:');
    err(data);
    err(e);
  }
}

export async function getPlaylists(): Promise<string[]> {
  log('getPlaylists');
  try {
    const res = await fsp.readdir(playlistDir());
    log('Playlists:');
    log(res);
    return res.map(playlistName);
  } catch (e) {
    err('Error while reading playlists:');
    err(e);
  }
  return [];
}

export type PlaylistSaveData = {
  name: string;
  songs: SongKey[];
};

// eslint-disable-next-line
export function isPlaylistSaveData(data: any): data is PlaylistSaveData {
  return (
    Type.hasStr(data, 'name') &&
    Type.has(data, 'songs') &&
    Type.isArrayOfString(data.songs)
  );
}

export async function savePlaylist(data: PlaylistSaveData): Promise<void> {
  log('savePlaylist');
  try {
    try {
      await fsp.mkdir(playlistDir(), { recursive: true });
    } catch (e) {
      /* */
    }
    await fsp.writeFile(
      playlistPath(data.name),
      await toDiskFormat(data.songs),
    );
  } catch (e) {
    err('Error while saving playlist:');
    err(data);
    err(e);
  }
}

export async function loadPlaylist(data: string): Promise<string[]> {
  log('loadPlaylist');
  try {
    const vals = await fsp.readFile(playlistPath(data), 'utf-8');
    return await fromDiskFormat(vals);
  } catch (e) {
    err('Error while loading playlist:');
    err(data);
    err(e);
  }
  return [];
}

export async function checkPlaylists(names: string[]): Promise<void> {
  log('checkPlaylists');
  if (Comparisons.ArraySetEqual<string>(names, await getPlaylists())) {
    log("They're equal");
  } else {
    err('NOT equal :/');
  }
  return;
}

let keyToPath: null | Map<SongKey, string> = null;
let pathToKey: null | Map<string, SongKey> = null;

async function loadHash(): Promise<void> {
  const songHash = await persist.getItemAsync('songHashIndex');
  if (!songHash) {
    throw Error('Oh poop'); // This shouldn't ever be possible...
  }
  const path2key = FTON.parse(songHash);
  if (Type.isMapOfStrings(path2key)) {
    pathToKey = path2key;
    keyToPath = new Map();
    pathToKey.forEach((val, key) => keyToPath!.set(val, key));
  } else {
    throw Error('Invalid songHashIndex');
  }
}

async function getKeyToPath(): Promise<Map<SongKey, string>> {
  while (keyToPath === null) {
    await loadHash();
  }
  return keyToPath;
}

async function getPathToKey(): Promise<Map<string, SongKey>> {
  while (pathToKey === null) {
    await loadHash();
  }
  return pathToKey;
}

async function toDiskFormat(keys: SongKey[]): Promise<string> {
  const k2p = await getKeyToPath();
  const res = ['#EXTM3U'];
  for (const key of keys) {
    const songpath = k2p.get(key);
    if (!songpath) {
      log(`Invalid SongKey ${key} in playlist`);
    } else {
      res.push(songpath);
    }
  }
  return res.join('\n');
}

async function fromDiskFormat(flat: string): Promise<SongKey[]> {
  const lines = flat.split('\n');
  const db = await getMusicDB();
  if (!db) {
    return [];
  }
  if (lines.length < 2 || lines[0] !== '#EXTM3U') {
    // Old format: Just a list of song keys. Filter 'em down
    return lines.filter((key) => db.songs.has(key));
  }
  const p2k = await getPathToKey();
  return lines
    .map((p) => p2k.get(p))
    .filter((kOrV) => Type.isString(kOrV) && db.songs.has(kOrV)) as SongKey[];
}
