import { render, within } from '../../setupTest';
import { LoadingSpinner, Loading } from '.';

import messages from './messages';

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.spinner-border');

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner-border-lg');
  });

  it('renders with custom size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.spinner-border');

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner-border-sm');
  });

  it('has correct accessibility attributes', () => {
    const { getByRole } = render(<LoadingSpinner />);
    const spinner = getByRole('status');

    expect(spinner).toBeInTheDocument();
    expect(within(spinner).getByText(messages.screenReaderText.defaultMessage)).toBeInTheDocument();
  });
});

describe('Loading', () => {
  it('renders full page loading spinner with correct styling', () => {
    const { container, getByRole } = render(<Loading />);
    const wrapper = container.firstChild;
    const spinner = getByRole('status');

    expect(wrapper).toHaveClass('d-flex', 'justify-content-center', 'align-items-center', 'flex-column', 'vh-100');
    expect(spinner).toBeInTheDocument();
  });
});
