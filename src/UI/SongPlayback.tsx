import { Slider, Text } from '@fluentui/react';
import { MakeLogger } from '@freik/core-utils';
import { SyntheticEvent } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { MaybePlayNext } from '../Recoil/api';
import {
  currentSongKeySel,
  MediaTime,
  mediaTimeAtom,
  mediaTimePercentRWSel,
  mediaTimePositionSel,
  mediaTimeRemainingSel,
  playingAtom,
  repeatAtom,
  songListAtom,
} from '../Recoil/Local';
import {
  albumKeyForSongKeySel,
  dataForSongSel,
  SongData,
} from '../Recoil/ReadOnly';
import './styles/SongPlayback.css';
import { mySliderStyles } from './Utilities';

const log = MakeLogger('SongPlayback');

export function GetAudioElem(): HTMLMediaElement | void {
  return document.getElementById('audioElement') as HTMLMediaElement;
}

function CoverArt(): JSX.Element {
  const songKey = useRecoilValue(currentSongKeySel);
  const albumKey = useRecoilValue(albumKeyForSongKeySel(songKey));

  return (
    <span id="song-cover-art">
      <img
        id="current-cover-art"
        src={`pic://album/${albumKey}`}
        alt="album cover"
      />
    </span>
  );
}

function MediaTimePosition(): JSX.Element {
  const mediaTimePosition = useRecoilValue(mediaTimePositionSel);
  return (
    <Text
      id="now-playing-current-time"
      variant="tiny"
      block={true}
      nowrap={true}
    >
      {mediaTimePosition}
    </Text>
  );
}

function MediaTimeRemaining(): JSX.Element {
  const mediaTimeRemaining = useRecoilValue(mediaTimeRemainingSel);
  return (
    <Text
      id="now-playing-remaining-time"
      variant="tiny"
      block={true}
      nowrap={true}
    >
      {mediaTimeRemaining}
    </Text>
  );
}

function MediaTimeSlider(): JSX.Element {
  const songKey = useRecoilValue(currentSongKeySel);
  const [mediaTimePercent, setMediaTimePercent] = useRecoilState(
    mediaTimePercentRWSel,
  );
  return (
    <Slider
      className="song-slider"
      value={mediaTimePercent}
      min={0}
      max={1}
      disabled={songKey.length === 0}
      step={1e-5}
      styles={mySliderStyles}
      onChange={(value: number) => {
        const ae = GetAudioElem();
        if (!ae) {
          return;
        }
        const targetTime = ae.duration * value;
        // eslint-disable-next-line id-blacklist
        if (targetTime < Number.MAX_SAFE_INTEGER && targetTime >= 0) {
          ae.currentTime = ae.duration * value;
        }
        setMediaTimePercent(value);
      }}
      showValue={false}
    />
  );
}

function SongName(): JSX.Element {
  const songKey = useRecoilValue(currentSongKeySel);
  const { title }: SongData = useRecoilValue(dataForSongSel(songKey));
  return (
    <Text id="song-name" variant="tiny" block={true} nowrap={true}>
      {title}
    </Text>
  );
}

function ArtistAlbum(): JSX.Element {
  const songKey = useRecoilValue(currentSongKeySel);
  const { artist, album }: SongData = useRecoilValue(dataForSongSel(songKey));
  if (songKey) {
    const split = artist.length && album.length ? ': ' : '';
    return (
      <Text
        id="artist-album"
        variant="tiny"
        block={true}
        nowrap={true}
      >{`${artist}${split}${album}`}</Text>
    );
  } else {
    return <span id="artist-album" />;
  }
}

export default function SongPlayback(): JSX.Element {
  const songKey = useRecoilValue(currentSongKeySel);
  const onPlay = useRecoilCallback(({ set }) => () => set(playingAtom, true));
  const onPause = useRecoilCallback(({ set }) => () => set(playingAtom, false));
  const onEnded = useRecoilCallback((cbInterface) => async () => {
    const { snapshot, set } = cbInterface;
    log('Heading to the next song!!!');
    const songList = await snapshot.getPromise(songListAtom);
    const rep = await snapshot.getPromise(repeatAtom);
    if (rep && songList.length === 1) {
      // Because we rely on auto-play, if we just try to play the same song
      // again, it won't start playing
      const ae = GetAudioElem();
      if (ae) {
        await ae.play();
      }
    }
    const isPlaying = await MaybePlayNext(cbInterface);
    set(playingAtom, isPlaying);
  });
  const onTimeUpdate = useRecoilCallback(
    ({ set }) => (ev: SyntheticEvent<HTMLMediaElement>) => {
      const ae = ev.currentTarget;
      // eslint-disable-next-line id-blacklist
      if (!Number.isNaN(ae.duration)) {
        set(mediaTimeAtom, (prevTime: MediaTime) => {
          if (
            Math.trunc(ae.duration) !== Math.trunc(prevTime.duration) ||
            Math.trunc(ae.currentTime) !== Math.trunc(prevTime.position)
          ) {
            return { position: ae.currentTime, duration: ae.duration };
          } else {
            return prevTime;
          }
        });
      }
    },
  );
  const audio =
    songKey !== '' ? (
      <audio
        id="audioElement"
        autoPlay={true}
        src={'tune://song/' + songKey}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
      />
    ) : (
      <audio id="audioElement" />
    );
  return (
    <span id="song-container">
      <CoverArt />
      <SongName />
      <ArtistAlbum />
      <MediaTimePosition />
      <MediaTimeSlider />
      <MediaTimeRemaining />
      {audio}
    </span>
  );
}
