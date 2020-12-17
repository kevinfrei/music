import { RecoilRoot } from 'recoil';
import PlaybackControls from './PlaybackControls';
import Sidebar from './Sidebar';
import SongDetailPanel from './SongDetailPanel';
import SongPlaying from './SongPlaying';
import './styles/App.css';
import Utilities, { Spinner } from './Utilities';
import ViewSelector from './Views/Selector';
import VolumeControl from './VolumeControl';

export default function App(): JSX.Element {
  return (
    <RecoilRoot>
      <Utilities />
      <span id="grabber"></span>
      <span id="left-column"></span>
      <span id="top-row"></span>
      <Spinner label="Intializing...">
        <PlaybackControls />
        <SongPlaying />
        <VolumeControl />
        <Sidebar />
      </Spinner>
      <Spinner label="Please wait...">
        <ViewSelector />
      </Spinner>
      <SongDetailPanel />
    </RecoilRoot>
  );
}
