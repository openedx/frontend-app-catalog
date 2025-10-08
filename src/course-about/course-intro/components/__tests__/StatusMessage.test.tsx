import { render, within, screen } from '@src/setupTest';
import { STATUS_MESSAGE_VARIANTS } from '../../constants';
import messages from '../../messages';
import { StatusMessage } from '../StatusMessage';

const renderStatusMessage = (
  variant: typeof STATUS_MESSAGE_VARIANTS[keyof typeof STATUS_MESSAGE_VARIANTS],
  messageKey: string,
) => render(
  <StatusMessage variant={variant} messageKey={messageKey} />,
);

describe('StatusMessage', () => {
  it('renders with success variant and correct message', () => {
    renderStatusMessage(STATUS_MESSAGE_VARIANTS.SUCCESS, 'statusMessageEnrolled');

    const statusMessage = screen.getByRole('status');
    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.SUCCESS}-500`);
    expect(within(statusMessage).getByText(messages.statusMessageEnrolled.defaultMessage)).toBeInTheDocument();
  });

  it('renders with info variant and correct message', () => {
    renderStatusMessage(STATUS_MESSAGE_VARIANTS.INFO, 'statusMessageFull');

    const statusMessage = screen.getByRole('status');
    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.INFO}-500`);
    expect(within(statusMessage).getByText(messages.statusMessageFull.defaultMessage)).toBeInTheDocument();
  });

  it('renders with danger variant and correct message', () => {
    renderStatusMessage(STATUS_MESSAGE_VARIANTS.DANGER, 'statusMessageEnrolled');

    const statusMessage = screen.getByRole('status');
    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.DANGER}-500`);
    expect(within(statusMessage).getByText(messages.statusMessageEnrolled.defaultMessage)).toBeInTheDocument();
  });
});
