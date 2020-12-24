import {
  DetailsList,
  ScrollablePane,
  ScrollbarVisibility,
  SelectionMode,
} from '@fluentui/react';
import { MakeError, Song, SongKey } from '@freik/core-utils';
import {
  atom,
  selector,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { AddSongs } from '../../Recoil/api';
import {
  allAlbumsState,
  allArtistsState,
  allSongsState,
  getDataForSongListState,
} from '../../Recoil/ReadOnly';
import { ignoreArticlesState } from '../../Recoil/ReadWrite';
import { SortSongList } from '../../Tools';
import { SongDetailContextMenuClick } from '../DetailPanel/Clickers';
import {
  AlbumFromSong,
  altRowRenderer,
  ArtistsFromSong,
  MakeColumns,
  StickyRenderDetailsHeader,
} from '../SongList';
import { Expandable } from '../Utilities';
import './styles/MixedSongs.css';

const err = MakeError('MixedSongs-err'); // eslint-disable-line

const sortOrderState = atom({ key: 'mixedSongSortOrder', default: 'rl' });
const sortedSongsState = selector({
  key: 'msSorted',
  get: ({ get }) => {
    return SortSongList(
      [...get(allSongsState).values()],
      get(allAlbumsState),
      get(allArtistsState),
      get(ignoreArticlesState),
      get(sortOrderState),
    );
  },
});

export default function MixedSongsList(): JSX.Element {
  const sortedItems = useRecoilValue(sortedSongsState);
  const [sortOrder, setSortOrder] = useRecoilState(sortOrderState);
  const onSongDetailClick = useRecoilCallback(SongDetailContextMenuClick);
  const onAddSongClick = useRecoilCallback((cbInterface) => (item: Song) =>
    AddSongs([item.key], cbInterface),
  );

  const columns = MakeColumns(
    [
      ['n', 'track', '#', 30, 30],
      ['r', 'artistIds', 'Artists(s)', 150, 450, ArtistsFromSong],
      ['l', 'albumId', 'Album', 150, 450, AlbumFromSong],
      ['t', 'title', 'Title', 150],
    ],
    () => sortOrder,
    setSortOrder,
  );
  return (
    <div className="songView" data-is-scrollable="true">
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          items={sortedItems}
          columns={columns}
          compact={true}
          selectionMode={SelectionMode.none}
          onRenderRow={altRowRenderer()}
          onRenderDetailsHeader={StickyRenderDetailsHeader}
          onItemContextMenu={onSongDetailClick}
          onItemInvoked={onAddSongClick}
        />
      </ScrollablePane>
    </div>
  );
}

export function SimpleSongsList({
  forSongs,
}: {
  forSongs: SongKey[];
}): JSX.Element {
  const songList = useRecoilValue(getDataForSongListState(forSongs));
  if (!songList) {
    return <></>;
  }
  const rl = songList
    .map((val) => val.artist.length)
    .reduce((pv, cv) => Math.max(pv, cv));
  const ll = songList
    .map((val) => val.album.length)
    .reduce((pv, cv) => Math.max(pv, cv));
  const nl = songList
    .map((val) => val.track.toString().length)
    .reduce((pv, cv) => Math.max(pv, cv));
  const tl = songList
    .map((val) => val.title.length)
    .reduce((pv, cv) => Math.max(pv, cv));
  const tot = rl + ll + nl + tl;
  return (
    <Expandable label="Files Selected">
      <div>
        <DetailsList
          items={songList}
          columns={[
            {
              key: 'r',
              fieldName: 'artist',
              name: 'Artist',
              minWidth: (100 * rl) / tot,
              maxWidth: (400 * rl) / tot,
              isResizable: true,
            },
            {
              key: 'l',
              fieldName: 'album',
              name: 'Album',
              minWidth: (100 * ll) / tot,
              maxWidth: (400 * ll) / tot,
              isResizable: true,
            },
            {
              key: 'n',
              fieldName: 'track',
              name: '#',
              minWidth: (100 * nl) / tot,
              maxWidth: (400 * nl) / tot,
              isResizable: true,
            },
            {
              key: 't',
              fieldName: 'title',
              name: 'Title',
              minWidth: (100 * tl) / tot,
              maxWidth: (400 * tl) / tot,
              isResizable: true,
            },
          ]}
          compact={true}
          selectionMode={SelectionMode.none}
          onRenderRow={altRowRenderer()}
        />
      </div>
    </Expandable>
  );
}
