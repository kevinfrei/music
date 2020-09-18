// eslint-disable-next-line @typescript-eslint/no-use-before-define
import * as React from 'react';
import { RecoilState, useRecoilState } from 'recoil';
import { Logger } from '@freik/core-utils';
import {
  Toggle,
  Dropdown,
  IDropdownOption,
  Stack,
  DefaultButton,
  Label,
  IconButton,
  Separator,
  Text,
} from '@fluentui/react';

import {
  sortWithArticlesAtom,
  albumListSortAtom,
  artistListSortAtom,
  songListSortAtom,
  locationsAtom,
} from '../../Recoil/SettingsAtoms';
import { ShowOpenDialog } from '../../MyWindow';

import './styles/Settings.css';
import { useBackedState } from '../../Recoil/helpers';

const log = Logger.bind('View-Settings');
// Logger.enable('View-Settings');

declare type PopupItem = {
  title: string;
  atom: RecoilState<string>;
  options: IDropdownOption[];
};

const removeFromSet = (set: string[], val: string): string[] => {
  const newSet = new Set(set);
  newSet.delete(val);
  return [...newSet];
};

function GetDirs(): string[] | void {
  return ShowOpenDialog({ properties: ['openDirectory'] });
}

function SortPopup({ data }: { data: PopupItem }): JSX.Element {
  const [value, setter] = useRecoilState(data.atom);
  const onChange = (
    event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption,
  ): void => {
    if (item) setter(item.key.toString());
  };
  return (
    <Dropdown
      label={`View ${data.title} by`}
      options={data.options}
      // eslint-disable-next-line id-blacklist
      selectedKey={value ? value : undefined}
      onChange={onChange}
    />
  );
}

function RecoilLocations(): JSX.Element {
  const [newLoc, setNewLoc] = useBackedState<string[]>(locationsAtom);
  log(`Locations (${locationsAtom.key}) value at render:`);
  log(newLoc);
  return (
    <>
      {(newLoc || []).map((elem) => (
        <Stack horizontal key={elem}>
          <IconButton
            onClick={() => setNewLoc(removeFromSet(newLoc, elem))}
            iconProps={{ iconName: 'Delete' }}
          />
          <Label>{elem}</Label>
        </Stack>
      ))}
      <Stack horizontal>
        <DefaultButton
          text="Add Location"
          onClick={() => {
            const locs: string[] | void = GetDirs();
            if (locs) {
              setNewLoc([...locs, ...(newLoc || [])]);
            }
          }}
          iconProps={{ iconName: 'Add' }}
        />
      </Stack>
    </>
  );
}

function ArticleSorting(): JSX.Element {
  const [articles, setArticles] = useRecoilState(sortWithArticlesAtom);
  log('Articles: ' + (articles ? 'true' : 'false'));
  function onChange(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
    setArticles(checked ? true : false);
  }
  return (
    <Toggle
      label="Consider articles when sorting"
      checked={articles}
      inlineLabel
      onText="On"
      offText="Off"
      onChange={onChange}
    />
  );
}

export default function Settings(): JSX.Element {
  const album = {
    title: 'Album',
    atom: albumListSortAtom,
    options: [
      { key: 'AlbumTitle', text: 'Title' },
      { key: 'AlbumYear', text: 'Year' },
      { key: 'ArtistAlbum', text: 'Artist, then Title' },
      { key: 'ArtistYear', text: 'Artist, then Year' },
    ],
  };
  const artist = {
    title: 'Artist',
    atom: artistListSortAtom,
    options: [
      { key: 'AlbumCount', text: '# of Albums' },
      { key: 'ArtistName', text: 'Name' },
      { key: 'SongCount', text: '# of Songs' },
    ],
  };
  const song = {
    title: 'Song',
    atom: songListSortAtom,
    options: [
      { key: 'SongTitle', text: 'Title' },
      { key: 'ArtistAlbum', text: 'Artist, then Album' },
      { key: 'AlbumTrack', text: 'Album' },
    ],
  };

  return (
    <div className="current-view">
      <Stack className="settings-view">
        <Separator alignContent="start">
          <Text variant="mediumPlus">Music Locations</Text>
        </Separator>
        <RecoilLocations />
        <Separator alignContent="start">
          <Text variant="mediumPlus">Sorting Preferences</Text>
        </Separator>
        <SortPopup data={album} />
        <SortPopup data={artist} />
        <SortPopup data={song} />
        <ArticleSorting />
      </Stack>
    </div>
  );
}
