import { render } from '../../setupTest';
import { AlertNotificationProps } from './types';
import { AlertNotification } from '.';

const renderComponent = (props: AlertNotificationProps) => render(<AlertNotification {...props} />);

describe('AlertNotification', () => {
  it('renders with default props', () => {
    const { getByText, getByRole } = renderComponent({
      title: 'Test Title',
      message: 'Test Message',
      variant: 'info',
    });

    expect(getByText('Test Title')).toBeInTheDocument();
    expect(getByText('Test Message')).toBeInTheDocument();
    expect(getByRole('alert')).toHaveClass('alert-info');
  });

  it('renders with custom variant', () => {
    const { getByRole } = renderComponent({
      title: 'Warning Title',
      message: 'Warning Message',
      variant: 'warning',
    });

    expect(getByRole('alert')).toHaveClass('alert-warning');
  });

  it('displays the info icon', () => {
    const { getByRole } = renderComponent({
      title: 'Alert with Icon',
      message: 'Has info icon',
      variant: 'info',
    });

    expect(getByRole('alert').querySelector('svg')).toBeInTheDocument();
  });
});
