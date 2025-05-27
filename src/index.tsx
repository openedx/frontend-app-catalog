import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize, mergeConfig,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';
import { createRoot } from 'react-dom/client';

import { configuration } from './config';
import App from './App';
import messages from './i18n';

import './index.scss';

const container = document.getElementById('root');

const root = createRoot(container!);
subscribe(APP_READY, () => {
  root.render(<App />);
});

subscribe(APP_INIT_ERROR, (error: { message: any; }) => {
  root.render(<ErrorPage message={error.message} />);
});

export const appName = 'CatalogAppConfig';

initialize({
  handlers: {
    config: () => {
      mergeConfig(configuration, appName);
    },
  },
  messages,
});
