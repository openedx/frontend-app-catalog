import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render as rtlRender } from '@testing-library/react';
import PropTypes from 'prop-types';

function render(ui) {
  const Wrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-filename-extension
    <IntlProvider locale="en">
      {children}
    </IntlProvider>
  );

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return rtlRender(ui, { wrapper: Wrapper });
}

export {
  render,
};
