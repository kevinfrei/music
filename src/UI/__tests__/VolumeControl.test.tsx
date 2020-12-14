import { initializeIcons } from '@uifabric/icons';
import { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import VolumeControl from '../VolumeControl';

jest.mock('../../MyWindow');

it('renders without crashing', async () => {
  initializeIcons();
  const div = document.createElement('div');
  ReactDOM.render(
    <RecoilRoot>
      <Suspense fallback="">
        <VolumeControl />
      </Suspense>
    </RecoilRoot>,
    div,
  );
  await VolumeControl;
  ReactDOM.unmountComponentAtNode(div);
});
