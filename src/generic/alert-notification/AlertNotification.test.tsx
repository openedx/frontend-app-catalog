import { render, screen } from '../../setupTest';
import { AlertNotificationProps } from './types';
import { AlertNotification } from '.';

const renderComponent = (props: AlertNotificationProps) => render(<AlertNotification {...props} />);

describe('AlertNotification', () => {
  it('renders with default props', () => {
    renderComponent({
      title: 'Test Title',
      message: 'Test Message',
      variant: 'info',
    });

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('alert-info');
  });

  it('renders with custom variant', () => {
    renderComponent({
      title: 'Warning Title',
      message: 'Warning Message',
      variant: 'warning',
    });

    expect(screen.getByRole('alert')).toHaveClass('alert-warning');
  });

  it('displays the info icon', () => {
    renderComponent({
      title: 'Alert with Icon',
      message: 'Has info icon',
      variant: 'info',
    });

    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();
  });
});
