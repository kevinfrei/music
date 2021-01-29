import {
  DetailsList,
  IconButton,
  IDetailsGroupRenderProps,
  Image,
  ImageFit,
  ScrollablePane,
  ScrollbarVisibility,
  SelectionMode,
  Stack,
  Text,
} from '@fluentui/react';
import {
  Album,
  AlbumKey,
  MakeError,
  MakeLogger,
  Song,
} from '@freik/core-utils';
import { useState } from 'react';
import {
  atom,
  CallbackInterface,
  selector,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { AddSongs } from '../../Recoil/api';
import { albumCoverUrlState } from '../../Recoil/Local';
import {
  allAlbumsState,
  allArtistsState,
  allSongsState,
  getAlbumByKeyState,
  getDataForAlbumState,
} from '../../Recoil/ReadOnly';
import { ignoreArticlesState } from '../../Recoil/ReadWrite';
import { SortSongList } from '../../Tools';
import { SongDetailContextMenuClick } from '../DetailPanel/Clickers';
import {
  AlbumFromSong,
  altRowRenderer,
  ArtistsFromSong,
  GetSongGroupData,
  StickyRenderDetailsHeader,
} from '../SongList';
import { SongListMenu, SongListMenuData } from '../SongMenus';
import './styles/Albums.css';

const err = MakeError('Albums-err'); // eslint-disable-line
const log = MakeLogger('Albums'); // eslint-disable-line

const albumContextState = atom<SongListMenuData>({
  key: 'albumContext',
  default: { data: '', spot: { left: 0, top: 0 } },
});

export function AlbumHeaderDisplay(props: { album: Album }): JSX.Element {
  const albumData = useRecoilValue(getDataForAlbumState(props.album.key));
  const onAddSongsClick = useRecoilCallback((cbInterface) => () =>
    AddSongs(cbInterface, props.album.songs),
  );
  const onRightClick = useRecoilCallback(
    ({ set }) => (event: React.MouseEvent<HTMLElement, MouseEvent>) =>
      set(albumContextState, {
        data: props.album.key,
        spot: { left: event.clientX + 14, top: event.clientY },
      }),
  );
  const picurl = useRecoilValue(albumCoverUrlState(props.album.key));
  return (
    <Stack
      horizontal
      verticalAlign="center"
      onDoubleClick={onAddSongsClick}
      onContextMenu={onRightClick}
      style={{ padding: '2px 0px', cursor: 'pointer' }}
    >
      <Image
        src={picurl}
        height={50}
        width={50}
        imageFit={ImageFit.centerContain}
      />
      <Text
        style={{ margin: '4px' }}
      >{`${albumData.album} - ${albumData.year} [${albumData.artist}]`}</Text>
    </Stack>
  );
}

// For grouping to work properly, the sort order needs to be fully specified
// Also, the album year & VA type have to "stick" with the album name as a
// single group, or you get duplicate group IDs
const sortOrderState = atom({ key: 'albumSortOrder', default: 'lyvntr' });
const sortedSongsState = selector({
  key: 'albumsSorted',
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

export default function AlbumList(): JSX.Element {
  const [albumContext, setAlbumContext] = useRecoilState(albumContextState);
  const albums = useRecoilValue(allAlbumsState);
  const sortedSongs = useRecoilValue(sortedSongsState);

  const [curSort, setSort] = useRecoilState(sortOrderState);

  const onSongDetailClick = useRecoilCallback(SongDetailContextMenuClick);
  const onAddSongClick = useRecoilCallback((cbInterface) => (item: Song) =>
    AddSongs(cbInterface, [item.key]),
  );

  const curExpandedState = useState(new Set<AlbumKey>());

  const renderAlbumHeader: IDetailsGroupRenderProps['onRenderHeader'] = (
    props,
  ): JSX.Element | null => {
    if (!props || !props.group) return null;
    const albumId = props.group.key;
    return (
      <Stack horizontal verticalAlign="center">
        <IconButton
          iconProps={{
            iconName: props.group?.isCollapsed ? 'ChevronRight' : 'ChevronDown',
          }}
          onClick={() => props.onToggleCollapse!(props.group!)}
        />
        <AlbumHeaderDisplay album={albums.get(albumId)!} />
      </Stack>
    );
  };
  const [columns, groups, groupProps] = GetSongGroupData(
    sortedSongs,
    curExpandedState,
    (s: Song) => s.albumId,
    (ak: AlbumKey) => {
      const album = albums.get(ak);
      if (!album) {
        return `Error: unknown album id: ${ak}`;
      }
      return `${album.title} - ${album.year}`;
    },
    'l',
    'albumId',
    [
      ['l', 'albumId', 'Album', 50, 175, AlbumFromSong],
      ['r', 'primaryArtists', 'Artist', 50, 250, ArtistsFromSong],
      ['n', 'track', '#', 10, 20],
      ['t', 'title', 'Title', 50, 150],
    ],
    () => curSort,
    setSort,
    3, // The length of the group key sort order (LYV)
  );
  groupProps.onRenderHeader = renderAlbumHeader;

  return (
    <div className="songListForAlbum" data-is-scrollable="true">
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.always}>
        <DetailsList
          items={sortedSongs}
          selectionMode={SelectionMode.none}
          groups={groups}
          columns={columns}
          compact
          onRenderRow={altRowRenderer()}
          onRenderDetailsHeader={StickyRenderDetailsHeader}
          onItemContextMenu={onSongDetailClick}
          onItemInvoked={onAddSongClick}
          groupProps={groupProps}
        />
        <SongListMenu
          context={albumContext}
          onClearContext={() =>
            setAlbumContext({ data: '', spot: { left: 0, top: 0 } })
          }
          onGetSongList={(cbInterface: CallbackInterface, data: string) => {
            const alb = cbInterface.snapshot
              .getLoadable(getAlbumByKeyState(data))
              .valueMaybe();
            return alb ? alb.songs : undefined;
          }}
        />
      </ScrollablePane>
    </div>
  );
}
