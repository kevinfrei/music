import {
  DetailsList,
  ScrollablePane,
  ScrollbarVisibility,
  SelectionMode,
} from '@fluentui/react';
import {
  Album,
  AlbumKey,
  Artist,
  ArtistKey,
  Song,
  SongKey,
} from '@freik/media-utils';
import React, { useState } from 'react'; // eslint-disable-line @typescript-eslint/no-use-before-define
import { useRecoilState, useRecoilValue } from 'recoil';
import { AddSongList } from '../../Recoil/api';
import {
  currentIndexAtom,
  songDetailAtom,
  songListAtom,
} from '../../Recoil/Local';
import {
  allAlbumsSel,
  allArtistsSel,
  allSongsSel,
} from '../../Recoil/ReadOnly';
import { sortWithArticlesAtom } from '../../Recoil/ReadWrite';
import { SortSongs } from '../../Tools';
import {
  AlbumFromSong,
  ArtistsFromSong,
  MakeColumns,
  renderAltRow,
  StickyRenderDetailsHeader,
} from '../SongList';
import { ViewProps } from './Selector';
import './styles/MixedSongs.css';

export default function MixedSongsList({ hidden }: ViewProps): JSX.Element {
  const songs: Map<SongKey, Song> = useRecoilValue(allSongsSel);
  const albums: Map<AlbumKey, Album> = useRecoilValue(allAlbumsSel);
  const artists: Map<ArtistKey, Artist> = useRecoilValue(allArtistsSel);
  const articles = useRecoilValue(sortWithArticlesAtom);
  const curIndexState = useRecoilState(currentIndexAtom);
  const songListState = useRecoilState(songListAtom);
  const [, setDetailSong] = useRecoilState(songDetailAtom);
  const [sortOrder, setSortOrder] = useState('rl');
  const [sortedItems, setSortedItems] = useState(
    SortSongs(sortOrder, [...songs.values()], albums, artists, articles),
  );

  const columns = MakeColumns(
    [
      ['n', 'track', '#', 30, 30],
      ['r', 'artistIds', 'Artists(s)', 150, 450, ArtistsFromSong],
      ['l', 'albumId', 'Album', 150, 450, AlbumFromSong],
      ['t', 'title', 'Title', 150],
    ],
    () => sortOrder,
    (srt: string) => {
      setSortOrder(srt);
      setSortedItems(SortSongs(srt, sortedItems, albums, artists, articles));
    },
  );

  return (
    <div
      className="current-view songView"
      data-is-scrollable="true"
      style={hidden ? { visibility: 'hidden' } : {}}
    >
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          items={sortedItems}
          columns={columns}
          compact={true}
          selectionMode={SelectionMode.none}
          onRenderRow={renderAltRow}
          onRenderDetailsHeader={StickyRenderDetailsHeader}
          onItemContextMenu={(item: Song) => setDetailSong(item)}
          onItemInvoked={(item: Song) =>
            AddSongList([item.key], curIndexState, songListState)
          }
        />
      </ScrollablePane>
    </div>
  );
}
