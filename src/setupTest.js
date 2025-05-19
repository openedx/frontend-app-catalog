import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  render as rtlRender, renderHook, waitFor, within,
} from '@testing-library/react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
      <MemoryRouter>
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
};
