// @flow

import React, { useEffect } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import Store from '../MyStore';

import VirtualAlbumView from './Albums';
import VirtualArtistView from './Artists';
import MixedSongView from './MixedSongs';
import RecentlyAddedView from './RecentlyAdded';
import NowPlayingView from './NowPlaying';
import SettingsView from './Settings';
import PlaylistsView from './Playlists';

import './styles/Selector.css';

import type { Properties } from 'csstype';
import type { ViewNames, MapNames, StoreState } from '../MyStore';

type RowCreatorParams = { index: number, style: Properties<> };
export type VirtualRowCreator = (param: RowCreatorParams) => React$Node;
export type VirtualViewInfo = {
  name: MapNames,
  height: number,
  rowCreator: VirtualRowCreator,
};

function scroll({ x, y }: { x: number, y: number }) {
  const target = document.getElementById('scrollview');
  if (!target) {
    setTimeout(() => scroll({ x, y }), 10);
  } else {
    target.scrollLeft = x;
    target.scrollTop = y;
  }
}

const virtualViews: Map<string, VirtualViewInfo> = new Map([
  ['album', VirtualAlbumView],
  ['artist', VirtualArtistView],
]);

function MakeVirtualView(store: StoreState, virtView: VirtualViewInfo) {
  const customView = ({ height, width }) => {
    const theMap = store.get(virtView.name);
    return (
      <FixedSizeList
        height={height}
        width={width}
        itemCount={theMap.size}
        itemSize={virtView.height}
      >
        {virtView.rowCreator}
      </FixedSizeList>
    );
  };
  return (
    <div id="scrollview" className="current-view">
      <AutoSizer>{customView}</AutoSizer>
    </div>
  );
}

export default function ViewSelector() {
  let store = Store.useStore();
  const which: ViewNames = store.get('curView');
  const scrollData = store.get('scrollManager');
  useEffect(() => {
    const pos = scrollData.get(which);
    if (pos) {
      scroll(pos);
    }
  }, [which, scrollData]);

  let pos = scrollData.get(which);
  if (!pos) {
    pos = { x: 0, y: 0 };
    scrollData.set(which, pos);
  }

  const virtView = virtualViews.get(which);
  if (virtView) {
    return MakeVirtualView(store, virtView);
  }

  let res;
  switch (which) {
    case 'playlist':
      res = <PlaylistsView />;
      break;
    case 'recent':
      res = <RecentlyAddedView />;
      break;
    case 'current':
      res = <NowPlayingView />;
      break;
    case 'settings':
      res = <SettingsView />;
      break;
    case 'song':
      return <MixedSongView />;
    default:
      return <></>;
  }

  const getScrollPosition = (ev) => {
    scrollData.set(which, { x: ev.target.scrollLeft, y: ev.target.scrollTop });
  };

  return (
    <div id="scrollview" className="current-view" onScroll={getScrollPosition}>
      {res}
    </div>
  );
}
