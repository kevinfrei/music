// @flow
// @format

import React from 'react';

import Store from './MyStore';

import './styles/VolumeControl.css';
import { GetAudioElem } from './SongPlayback';

export default function VolumeControl() {
  const store = Store.useStore();

  const muted = store.get('muted');
  const setMuted = store.set('muted');
  const volume = store.get('volume');
  const setVolume = store.set('volume');

  let ae = GetAudioElem();

  if (ae) {
    ae.muted = muted;
    ae.volume = volume;
  }
  return (
    <span id="volume-container">
      <span
        id="mute"
        className={muted ? 'muted' : 'not-muted'}
        onClick={() => setMuted(!muted)}
      >
        &nbsp;
      </span>
      <input
        type="range"
        id="volume-slider"
        min={0}
        max={1}
        value={volume}
        step={0.01}
        onChange={(ev) => {
          setVolume(ev.target.valueAsNumber);
          if (muted) {
            setMuted(false);
          }
        }}
      />
    </span>
  );
}