import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
//@ts-ignore
import VirtualizedList from '@dwqs/react-virtual-list';
import AutoSizer from 'react-virtualized-auto-sizer';

import Store from '../MyStore';

import { getMediaInfo } from '../Atoms';
import SongLine from '../SongLine';
import { AddSong } from '../Playlist';
import { VerticalScrollFixedVirtualList } from '../Scrollables';

import type { Properties } from 'csstype';

import './styles/MixedSongs.css';
import { useRecoilValue } from 'recoil';

function mediaInfoToLine(keyPrefix: string, strs: Map<string, string>) {
  const lines: React.ReactNode[] = [];
  strs.forEach((val, key) =>
    lines.push(
      <tr key={keyPrefix + key}>
        <td>{key}</td>
        <td colSpan={3}>{val}</td>
      </tr>,
    ),
  );
  return lines;
}

function MediaInfoTable({ id }: { id: string }) {
  const mediaInfo: any = useRecoilValue(getMediaInfo(id));
  if (mediaInfo) {
    const genLines = mediaInfoToLine('gen', mediaInfo.general);
    const audLines = mediaInfoToLine('aud', mediaInfo.audio);
    return (
      <table>
        <thead>
          <tr>
            <td>General</td>
          </tr>
        </thead>
        <tbody>{genLines}</tbody>
        <thead>
          <tr>
            <td>Audio</td>
          </tr>
        </thead>
        <tbody>{audLines}</tbody>
      </table>
    );
  } else {
    return <></>;
  }
}

export default function MixedSongView() {
  const store = Store.useStore();
  const songs = store.get('Songs');
  const songArray = store.get('SongArray');
  const [selected, setSelected] = useState('');

  const handleClose = () => setSelected('');

  const VirtualSongRow = ({ index }: { index: number }): React.ReactNode => {
    // style={style}
    return (
      <SongLine
        template="RL#T"
        key={index}
        className={
          index & 1
            ? 'songContainer evenMixedSong'
            : 'songContainer oddMixedSong'
        }
        songKey={songArray[index]}
        onDoubleClick={AddSong}
        onAuxClick={(store, songKey) => setSelected(songKey)}
      />
    );
  };
  // height={height}
  const customView = ({ height, width }: { height: number; width: number }) => (
    <div style={{ width, height, border: '0px' }}>
      <VirtualizedList
        height={height}
        useWindow={false}
        itemCount={songArray.length}
        estimatedItemHeight={32}
        renderItem={VirtualSongRow}
        overscanCount={50}
      />
    </div>
  );
  return (
    <div className="songView">
      <React.Suspense fallback="Please wait...">
        <Modal show={!!selected} onHide={handleClose}>
          <Modal.Dialog>
            <Modal.Header closeButton>
              <Modal.Title>Metadata</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <MediaInfoTable id={selected} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal>
      </React.Suspense>
      <div className="songContainer songHeader">
        <span className="songArtist">Artist</span>
        <span className="songAlbum">Album</span>
        <span className="songTrack">#</span>
        <span className="songTitle">Title</span>
      </div>
      <AutoSizer>{customView}</AutoSizer>
    </div>
  );
}