import { render, screen, within } from '@testing-library/react';
import { IntlProvider } from '@openedx/frontend-base';

import { Loading as ActualLoading, LoadingSpinner as ActualLoadingSpinner } from '.';

import messages from './messages';

const LoadingSpinner = (props: React.ComponentProps<typeof ActualLoadingSpinner>) => (
  <IntlProvider locale="en"><ActualLoadingSpinner {...props} /></IntlProvider>
);

const Loading = () => (
  <IntlProvider locale="en"><ActualLoading /></IntlProvider>
);

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.spinner-border');

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner-border');
  });

  it('renders with custom size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.spinner-border');

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner-border-sm');
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');

    expect(spinner).toBeInTheDocument();
    expect(within(spinner).getByText(messages.screenReaderText.defaultMessage)).toBeInTheDocument();
  });
});

describe('Loading', () => {
  it('renders full page loading spinner with correct styling', () => {
    const { container } = render(<Loading />);
    const wrapper = container.firstChild;
    const spinner = screen.getByRole('status');

    expect(wrapper).toHaveClass('d-flex', 'justify-content-center', 'align-items-center', 'flex-column', 'vh-100');
    expect(spinner).toBeInTheDocument();
  });
});
