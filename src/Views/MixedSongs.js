// @flow
import React from 'react';
import Store from '../MyStore';

const MixedSongLine = ({ song, album }) => (
  <div>
    <span>
      {song.track} - {song.title}
    </span>
  </div>
);

const MixedSongsView = () => {
  let store = Store.useStore();
  const songs = store.get('Songs');
  const albums = store.get('Albums');
  const artists = store.get('Artists');
  const sng = Array.from(songs.values());
  sng.sort((a, b) => {
    const aArt = artists.get(a.artistIds[0]).name.toLowerCase();
    const bArt = artists.get(b.artistIds[0]).name.toLowerCase();
    let res = aArt.localeCompare(bArt);
    if (res !== 0) {
      return res;
    }
    const aAlb = albums.get(a.albumId).title.toLowerCase();
    const bAlb = albums.get(b.albumId).title.toLowerCase();
    res = aAlb.localeCompare(bAlb);
    if (res !== 0) {
      return res;
    }
    if (a.Track === b.Track) {
      return 0;
    }
    return a.Track < b.Track ? 1 : -1;
  });
  return (
    <div>
      {sng.map(s => (
        <MixedSongLine key={s.key} song={s} album={albums.get(s.albumId)} />
      ))}
    </div>
  );
};

export default MixedSongsView;
