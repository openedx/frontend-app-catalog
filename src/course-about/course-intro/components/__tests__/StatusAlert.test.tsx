import { render, within, screen } from '@src/setupTest';
import { ALERT_VARIANTS } from '../../constants';
import messages from '../../messages';
import { StatusAlert } from '../StatusAlert';

const renderStatusAlert = (variant: typeof ALERT_VARIANTS[keyof typeof ALERT_VARIANTS], messageKey: string) => render(
  <StatusAlert variant={variant} messageKey={messageKey} />,
);

describe('StatusAlert', () => {
  it('renders with success variant and correct message', () => {
    renderStatusAlert(ALERT_VARIANTS.SUCCESS, 'statusAlertEnrolled');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(`alert-${ALERT_VARIANTS.SUCCESS}`);
    expect(within(alert).getByText(messages.statusAlertEnrolled.defaultMessage)).toBeInTheDocument();
  });

  it('renders with info variant and correct message', () => {
    renderStatusAlert(ALERT_VARIANTS.INFO, 'statusAlertFull');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(`alert-${ALERT_VARIANTS.INFO}`);
    expect(within(alert).getByText(messages.statusAlertFull.defaultMessage)).toBeInTheDocument();
  });

  it('renders with danger variant and correct message', () => {
    renderStatusAlert(ALERT_VARIANTS.DANGER, 'statusAlertEnrolled');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(`alert-${ALERT_VARIANTS.DANGER}`);
    expect(within(alert).getByText(messages.statusAlertEnrolled.defaultMessage)).toBeInTheDocument();
  });
});
