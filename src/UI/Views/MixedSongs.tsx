// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React, { useState } from 'react';
import {
  DetailsList,
  DetailsRow,
  Dialog,
  DialogType,
  getTheme,
  IDetailsListProps,
  IDetailsRowStyles,
  SelectionMode,
} from '@fluentui/react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { Logger } from '@freik/core-utils';

import { getMediaInfo } from '../../Recoil/Atoms';
import { allSongsSel } from '../../Recoil/MusicDbAtoms';
import { addSongAtom } from '../../Recoil/api';

import type { Song, SongKey } from '../../MyStore';
import type { MediaInfo } from '../../Recoil/Atoms';

import './styles/MixedSongs.css';

const log = Logger.bind('MixedSongs');
Logger.enable('MixedSongs');

function mediaInfoToLine(keyPrefix: string, strs: Map<string, string>) {
  const lines: JSX.Element[] = [];
  log(keyPrefix);
  log(strs);
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
  const mediaInfo: MediaInfo = useRecoilValue(getMediaInfo(id));
  if (mediaInfo) {
    log('Here we are');
    log(mediaInfo);
    const genLines = mediaInfoToLine('gen', mediaInfo.general);
    log('Here we are again');
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
/*
function OldMixedSongView(): JSX.Element {
  //  const store = Store.useStore();
  //  const songArray = store.get('SongArray');
  const songs: Map<SongKey, Song> = useRecoilValue(AllSongs);
  const [selected, setSelected] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const songArray = [...songs.keys()];

  const VirtualSongRow = ({ index }: { index: number }): React.ReactNode => {
    // style={style}
    return (
      <SongLine
        template="RL#T"
        key={index}
        className={
          index % 2
            ? 'songContainer evenMixedSong'
            : 'songContainer oddMixedSong'
        }
        songKey={songArray[index]}
       onDoubleClick={AddSong}
        onAuxClick={(theStore, songKey) => {
          setSelected(songKey);
          setShowDialog(true);
        }}
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
    <div className="songView current-view">
      <React.Suspense fallback="Please wait...">
        <Dialog
          hidden={!showDialog}
          onDismiss={() => setShowDialog(false)}
          dialogContentProps={{ type: DialogType.close, title: 'Metadata' }}
        >
          <MediaInfoTable id={selected} />
        </Dialog>
        <div className="songContainer songHeader">
          <span className="songArtist">Artist</span>
          <span className="songAlbum">Album</span>
          <span className="songTrack">#</span>
          <span className="songTitle">Title</span>
        </div>
        <AutoSizer>{customView}</AutoSizer>
      </React.Suspense>
    </div>
  );
}
*/
const theme = getTheme();

export default function MixedSongsList(): JSX.Element {
  const songs: Map<SongKey, Song> = useRecoilValue(allSongsSel);
  const [selected, setSelected] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [, addSong] = useRecoilState(addSongAtom);
  const renderRow: IDetailsListProps['onRenderRow'] = (props) => {
    const customStyles: Partial<IDetailsRowStyles> = {};
    if (props) {
      if (props.itemIndex % 2 === 0) {
        // Every other row renders with a different background color
        customStyles.root = { backgroundColor: theme.palette.themeLighterAlt };
      }
      return <DetailsRow {...props} styles={customStyles} />;
    }
    return null;
  };

  return (
    <div className="songView current-view">
      <Dialog
        hidden={!showDialog}
        onDismiss={() => setShowDialog(false)}
        dialogContentProps={{ type: DialogType.close, title: 'Metadata' }}
      >
        <MediaInfoTable id={selected} />
      </Dialog>
      <DetailsList
        items={[...songs.values()]}
        selectionMode={SelectionMode.none}
        onRenderRow={renderRow}
        onItemContextMenu={(item: Song) => {
          setSelected(item.key);
          setShowDialog(true);
        }}
        onItemInvoked={(item: Song) => addSong(item.key)}
      />
    </div>
  );
}