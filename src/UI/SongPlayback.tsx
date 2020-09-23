// eslint-disable-next-line @typescript-eslint/no-use-before-define
import { Slider } from '@fluentui/react';
import { Logger } from '@freik/core-utils';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MaybePlayNextSong } from '../Recoil/api';
import {
  currentIndexAtom,
  currentSongKeySel,
  mediaTimeAtom,
  mediaTimePercentRWSel,
  mediaTimePositionSel,
  mediaTimeRemainingSel,
  playingAtom,
  repeatAtom,
  shuffleAtom,
  songListAtom,
} from '../Recoil/Local';
import {
  albumKeyForSongKeySel,
  dataForSongSel,
  SongData,
} from '../Recoil/ReadOnly';
import './styles/SongPlayback.css';

const log = Logger.bind('SongPlayback');
// Logger.enable('SongPlayback');

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
      />{' '}
    </span>
  );
}

function MediaTimePosition(): JSX.Element {
  const mediaTimePosition = useRecoilValue(mediaTimePositionSel);
  return <span id="now-playing-current-time">{mediaTimePosition}</span>;
}

function MediaTimeRemaining(): JSX.Element {
  const mediaTimeRemaining = useRecoilValue(mediaTimeRemainingSel);
  return <span id="now-playing-remaining-time">{mediaTimeRemaining}</span>;
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
  return <span id="song-name">{title}</span>;
}

function ArtistAlbum(): JSX.Element {
  const songKey = useRecoilValue(currentSongKeySel);
  const { artist, album }: SongData = useRecoilValue(dataForSongSel(songKey));
  if (songKey) {
    const split = artist.length && album.length ? ': ' : '';
    return <span id="artist-album">{`${artist}${split}${album}`}</span>;
  } else {
    return <span id="artist-album" />;
  }
}

export default function SongPlayback(): JSX.Element {
  const [mediaTime, setMediaTime] = useRecoilState(mediaTimeAtom);
  let audio: React.ReactElement<HTMLAudioElement>;
  const songKey = useRecoilValue(currentSongKeySel);
  const [, setPlaying] = useRecoilState(playingAtom);
  const [curIndex, setCurIndex] = useRecoilState(currentIndexAtom);
  const [songList, setSongList] = useRecoilState(songListAtom);
  const rep = useRecoilValue(repeatAtom);
  const shuf = useRecoilValue(shuffleAtom);
  const maybeNextSong = () => {
    log('Heading to the next song!!!');
    setPlaying(
      MaybePlayNextSong(
        curIndex,
        setCurIndex,
        rep,
        shuf,
        songList,
        setSongList,
      ),
    );
  };
  if (songKey !== '') {
    audio = (
      <audio
        id="audioElement"
        autoPlay={true}
        src={'tune://song/' + songKey}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={maybeNextSong}
        onTimeUpdate={(ev: React.SyntheticEvent<HTMLMediaElement>) => {
          const ae = ev.target as HTMLMediaElement;
          if (
            !Number.isNaN(ae.duration) && // eslint-disable-line id-blacklist
            (Math.trunc(ae.duration) !== Math.trunc(mediaTime.duration) ||
              Math.trunc(ae.currentTime) !== Math.trunc(mediaTime.position))
          ) {
            log(
              `${ae.readyState}: Duration: ${ae.duration} Current time: ${ae.currentTime}`,
            );
            setMediaTime({ position: ae.currentTime, duration: ae.duration });
          }
        }}
      />
    ) as React.ReactElement<HTMLAudioElement>;
  } else {
    audio = <audio id="audioElement" />;
  }
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
