import 'core-js/stable';
import 'regenerator-runtime/runtime';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  render as rtlRender, renderHook, waitFor, within, screen, cleanup,
} from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as reactRouter from 'react-router';

function render(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-filename-extension
    <QueryClientProvider client={queryClient}>
      {/* eslint-disable-next-line no-underscore-dangle */}
      <MemoryRouter initialEntries={window.testHistory || ['/']}>
        <IntlProvider locale="en">
          {children}
        </IntlProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return rtlRender(ui, { wrapper: Wrapper });
}

export {
  render,
  renderHook,
  within,
  waitFor,
  screen,
  userEvent,
  cleanup,
  reactRouter,
};
