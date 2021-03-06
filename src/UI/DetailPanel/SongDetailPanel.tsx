import { ContextualMenu, Dialog, DialogType } from '@fluentui/react';
import { MakeError } from '@freik/core-utils';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { songDetailState } from '../../Recoil/Local';
import { maybeGetDataForSongState } from '../../Recoil/ReadOnly';
import { Spinner } from './../Utilities';
import MediaInfoTable from './MediaInfo';

const err = MakeError('SongDetailPanel-err'); // eslint-disable-line

export default function SongDetailPanel(): JSX.Element {
  const detailSongs = useRecoilValue(songDetailState);
  const songInfo = useRecoilValue(maybeGetDataForSongState([...detailSongs]));
  const dismissClick = useRecoilCallback(({ reset }) => () =>
    reset(songDetailState),
  );
  let elem;
  let header = '';
  if (detailSongs.size === 0) {
    elem = <div />;
    header = 'No file selected';
  } else if (detailSongs.size === 1) {
    elem = <MediaInfoTable keyOrKeys={[...detailSongs][0]} />;
    header = `Details for ${songInfo!.title}`;
  } else {
    elem = <MediaInfoTable keyOrKeys={[...detailSongs]} />;
    header = `Details for ${detailSongs.size} songs`;
  }

  return detailSongs.size === 0 ? (
    <></> // Doing it this way makes it disappear, instead of 2-phase mess
  ) : (
    <Dialog
      hidden={detailSongs.size === 0}
      dialogContentProps={{
        type: DialogType.normal,
        title: header,
      }}
      modalProps={{
        isBlocking: true,
        dragOptions: {
          moveMenuItemText: 'Move',
          closeMenuItemText: 'Close',
          menu: ContextualMenu,
        },
      }}
      minWidth={575}
      onDismiss={dismissClick}
      isBlocking={false}
      closeButtonAriaLabel="Close"
    >
      <Spinner label="Loading...">{elem}</Spinner>
    </Dialog>
  );
}
