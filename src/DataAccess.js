// @flow

import type { StoreState, SongKey, AlbumKey, Song, Album } from './MyStore';

export const GetDataForSong = (
  store: StoreState,
  sk: SongKey
): { title: string, track: number, artist: string, album: string } => {
  let res = { title: '-', track: 0, artist: '-', album: '-' };
  const allSongs: ?Map<SongKey, Song> = store.get('Songs');
  if (!allSongs) {
    return res;
  }
  const song: ?Song = allSongs.get(sk);
  if (!song) {
    return res;
  }
  res.title = song.title;
  res.track = song.track;
  const allAlbums: ?Map<AlbumKey, Album> = store.get('Albums');
  if (!allAlbums) {
    return res;
  }
  const album: ?Album = allAlbums.get(song.albumId);
  if (album) {
    res.album = album.title;
  }
  const allArtists: ?Map<ArtistKey, Artist> = store.get('Artists');
  if (!allArtists) {
    return res;
  }
  const artists: Array<string> = song.artistIds
    .map((ak) => {
      const art: ?Artist = allArtists.get(ak);
      return art ? art.name : '';
    })
    .filter((a) => a.length > 0);
  let artist = '';
  if (artists.length === 1) {
    artist = artists[0];
  } else {
    artist = ' & ' + artists.pop();
    artist = artists.join(', ') + artist;
  }
  res.artist = artist;
  return res;
};