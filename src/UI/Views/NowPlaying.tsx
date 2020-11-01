import {
  DefaultButton,
  DetailsList,
  DetailsRow,
  getTheme,
  IconButton,
  IDetailsListProps,
  IDetailsRowStyles,
  SelectionMode,
  Text,
} from '@fluentui/react';
import { Comparisons } from '@freik/core-utils';
import {
  Album,
  AlbumKey,
  Artist,
  ArtistKey,
  Song,
  SongKey,
} from '@freik/media-utils';
import React from 'react'; // eslint-disable-line @typescript-eslint/no-use-before-define
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
} from 'recoil';
import { StopAndClear } from '../../Recoil/api';
import { useDialogState } from '../../Recoil/helpers';
import {
  currentIndexAtom,
  nowPlayingAtom,
  nowPlayingSortAtom,
  shuffleAtom,
  songDetailAtom,
  songListAtom,
} from '../../Recoil/Local';
import {
  allAlbumsSel,
  allArtistsSel,
  curSongsSel,
} from '../../Recoil/ReadOnly';
import { playlistsSel, sortWithArticlesAtom } from '../../Recoil/ReadWrite';
import { isPlaylist, SortSongs } from '../../Tools';
import { ConfirmationDialog, TextInputDialog } from '../Dialogs';
import { AlbumFromSong, ArtistsFromSong, MakeColumns } from '../SongList';
import { ViewProps } from './Selector';
import './styles/NowPlaying.css';

const theme = getTheme();

// The top line of the Now Playing view: Buttons & dialogs & stuff
function TopLine(): JSX.Element {
  const [playlists, setPlaylists] = useRecoilState(playlistsSel);
  const nowPlaying = useRecoilValue(nowPlayingAtom);

  const songList = useRecoilValue(songListAtom);

  const [showSaveAs, saveAsData] = useDialogState();
  const [showConfirm, confirmData] = useDialogState();

  const saveListAs = useRecoilCallback(({ set }) => (inputName: string) => {
    if (playlists.has(inputName)) {
      window.alert("Sorry: You can't overwrite an existing playlist.");
    } else {
      const newPlaylist = playlists.set(inputName, songList);
      setPlaylists(new Map(newPlaylist));
      set(nowPlayingAtom, inputName);
    }
  });

  const emptyQueue = songList.length === 0;

  const stopAndClear = useRecoilCallback(
    ({ reset, set, snapshot }) => async () => {
      await StopAndClear({ reset, set, snapshot });
    },
  );
  const clickClearQueue = useRecoilCallback(
    ({ reset, set, snapshot }) => async () => {
      if (isPlaylist(nowPlaying)) {
        await StopAndClear({ reset, set, snapshot });
      } else {
        showConfirm();
      }
    },
  );
  let header;
  let saveDisabled: boolean;
  const save = () => {
    playlists.set(nowPlaying, songList);
    setPlaylists(new Map(playlists));
  };
  if (isPlaylist(nowPlaying)) {
    header = nowPlaying;
    // Only enable this button if the playlist has been *modified*
    // (not just sorted)
    const curPlList = playlists.get(nowPlaying);
    saveDisabled = !curPlList || Comparisons.ArraySetEqual(songList, curPlList);
  } else {
    header = 'Now Playing';
    saveDisabled = true;
  }

  return (
    <div id="current-header">
      <TextInputDialog
        data={saveAsData}
        confirmFunc={saveListAs}
        title="Save Playlist as..."
        text="What would you like the playlist to be named?"
        initialValue={nowPlaying}
        yesText="Save"
        noText="Cancel"
      />
      <ConfirmationDialog
        data={confirmData}
        confirmFunc={stopAndClear}
        title="Please Confirm"
        text="Are you sure you want to clear the play queue?"
      />
      <div id="now-playing-header">
        <DefaultButton
          className="np-clear-queue"
          onClick={clickClearQueue}
          disabled={emptyQueue}
        >
          Clear Queue
        </DefaultButton>
        <Text
          className="np-current-playlist"
          variant="large"
          block={true}
          nowrap={true}
        >
          {header}
        </Text>
        <DefaultButton
          className="save-playlist-as"
          onClick={showSaveAs}
          disabled={emptyQueue}
        >
          Save As...
        </DefaultButton>
        <DefaultButton
          onClick={save}
          className="save-playlist"
          disabled={saveDisabled}
        >
          Save
        </DefaultButton>
      </div>
    </div>
  );
}

// The Now Playing (Current playlist) view
export default function NowPlaying({ hidden }: ViewProps): JSX.Element {
  const albums: Map<AlbumKey, Album> = useRecoilValue(allAlbumsSel);
  const artists: Map<ArtistKey, Artist> = useRecoilValue(allArtistsSel);
  const articles = useRecoilValue(sortWithArticlesAtom);
  const onSongDetailClick = useRecoilCallback(({ set }) => (item: Song) =>
    set(songDetailAtom, item),
  );
  const [curIndex, setCurIndex] = useRecoilState(currentIndexAtom);
  const [songList, setSongList] = useRecoilState(songListAtom);
  const resetShuffle = useResetRecoilState(shuffleAtom);
  const [sortBy, setSortBy] = useRecoilState(nowPlayingSortAtom);
  const curSongs = useRecoilValue(curSongsSel);

  const drawDeleter = (song: Song) => (
    <IconButton
      style={{ height: '18px', width: '18px' }}
      iconProps={{ iconName: 'Delete' }}
      onClick={() => {
        setSongList(songList.filter((v) => v !== song.key));
      }}
    />
  );

  const performSort = (srt: string) => {
    setSortBy(srt);
    if (srt !== '') {
      const sortedSongs = SortSongs(srt, curSongs, albums, artists, articles);
      const curKey: SongKey = songList[curIndex];
      let newKey = -1;
      const newSongList = sortedSongs.map((song: Song, index: number) => {
        if (song.key === curKey) {
          newKey = index;
        }
        return song.key;
      });
      setSongList(newSongList);
      setCurIndex(newKey);
      resetShuffle();
    }
  };

  const columns = MakeColumns(
    [
      ['X', '', '', 25, 25, drawDeleter],
      ['l', 'albumId', 'Album', 50, 175, AlbumFromSong],
      ['r', 'artistIds', 'Artist(s)', 50, 150, ArtistsFromSong],
      ['n', 'track', '#', 10, 20],
      ['t', 'title', 'Title', 50, 150],
    ],
    () => sortBy,
    performSort,
  );

  // This does the light/dark swapping, with the current song in bold
  const renderAltRow: IDetailsListProps['onRenderRow'] = (props) => {
    const customStyles: Partial<IDetailsRowStyles> = {};
    if (props) {
      let backgroundColor = '';
      let fontWeight = 'normal';
      if (props.itemIndex === curIndex) {
        fontWeight = 'bold';
      }
      if (props.itemIndex % 2 === 0) {
        backgroundColor = theme.palette.themeLighterAlt;
      }
      customStyles.root = { backgroundColor, fontWeight };
      return <DetailsRow {...props} styles={customStyles} />;
    }
    return null;
  };

  return (
    <div
      className="current-view"
      style={hidden ? { visibility: 'hidden' } : {}}
    >
      <TopLine />
      <div className="current-view">
        <DetailsList
          compact={true}
          items={curSongs}
          selectionMode={SelectionMode.none}
          onRenderRow={renderAltRow}
          columns={columns}
          onItemContextMenu={onSongDetailClick}
          onItemInvoked={(item, index) => setCurIndex(index ?? -1)}
        />
      </div>
    </div>
  );
}
