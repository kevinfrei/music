// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React, { useState, CSSProperties } from 'react';
import { Dialog, DialogType } from '@fluentui/react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { VerticalScrollFixedVirtualList } from '../Scrollables';
import SongLine from '../SongLine';

import './styles/Artists.css';
import { addArtistAtom, addSongAtom } from '../../Recoil/api';
import { allArtistsSel } from '../../Recoil/MusicDbAtoms';

import type { Artist } from '../../MyStore';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const downChevron = require('../img/down-chevron.svg') as string;

export default function ArtistView(): JSX.Element {
  const [, addSong] = useRecoilState(addSongAtom);
  const [, addArtist] = useRecoilState(addArtistAtom);
  const artists = useRecoilValue(allArtistsSel);
  const artistArray: Artist[] = [...artists.values()];
  const [expandedArtist, setExpandedArtist] = useState('');
  const handleClose = () => setExpandedArtist('');

  function VirtualArtistRow({
    index,
    style,
  }: {
    index: number;
    style: CSSProperties;
  }): JSX.Element {
    const artist = artistArray[index];
    if (!artist) {
      return <div>{`Error for element ${index}`}</div>;
    }
    return (
      <div
        className="artistContainer"
        style={style}
        onDoubleClick={() => addArtist(artist.key)}
      >
        <div className="artistName">
          {artist.name} &nbsp;
          <img
            onClick={() => setExpandedArtist(artist.key)}
            src={downChevron}
            className="artistChevron"
            alt="expander"
          />
        </div>
        <div className="artistSummary">
          {artist.songs.length} Songs and {artist.albums.length} Albums
        </div>
      </div>
    );
  }

  let details = <></>;
  let dialogHeader = <></>;
  if (!!expandedArtist) {
    const art = artists.get(expandedArtist);
    if (art) {
      dialogHeader = <>{`Song list for ${art.name}`}</>;
      details = (
        <div className="songListForArtist">
          {art.songs.map((k) => (
            <SongLine
              template="L#T"
              key={k}
              className="songForArtist"
              songKey={k}
              onDoubleClick={(s, sk) => addSong(sk)}
            />
          ))}
        </div>
      );
    }
  }
  return (
    <div className="artistView">
      <Dialog
        hidden={!expandedArtist}
        onDismiss={handleClose}
        dialogContentProps={{ type: DialogType.close, title: dialogHeader }}
      >
        {details}
      </Dialog>
      <VerticalScrollFixedVirtualList
        scrollId="ArtistsScrollId"
        itemCount={artists.size}
        itemSize={50}
        itemGenerator={VirtualArtistRow}
      />
    </div>
  );
}