import { render, userEvent } from '../../../../setupTest';
import messages from '../../messages';
import { EnrollmentButton } from '../EnrollmentButton';

const user = userEvent.setup();

describe('EnrollmentButton', () => {
  const defaultProps = {
    onEnroll: jest.fn(),
    singlePaidMode: {},
    ecommerceCheckout: false,
    isEnrollmentPending: false,
    onEcommerceCheckout: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders with default enrollment text', () => {
    const { getByText } = render(<EnrollmentButton {...defaultProps} />);
    expect(getByText(messages.enrollNowBtn.defaultMessage)).toBeInTheDocument();
  });

  it('shows pending text when enrollment is pending', () => {
    const { getByText } = render(<EnrollmentButton {...defaultProps} isEnrollmentPending />);
    expect(getByText(messages.enrollNowBtnPending.defaultMessage)).toBeInTheDocument();
  });

  it('calls onEnroll when clicked in default mode', async () => {
    const { getByText } = render(<EnrollmentButton {...defaultProps} />);

    await user.click(getByText(messages.enrollNowBtn.defaultMessage));
    expect(defaultProps.onEnroll).toHaveBeenCalledTimes(1);
  });

  it('calls onEcommerceCheckout when clicked in ecommerce mode', async () => {
    const { getByText } = render(<EnrollmentButton {...defaultProps} ecommerceCheckout />);

    await user.click(getByText(messages.enrollNowBtn.defaultMessage));
    expect(defaultProps.onEcommerceCheckout).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEnroll).not.toHaveBeenCalled();
  });

  it('renders button with correct attributes and classes', () => {
    const { getByRole } = render(<EnrollmentButton {...defaultProps} />);

    const button = getByRole('button', {
      name: messages.enrollNowBtn.defaultMessage,
    });

    expect(button).toHaveAttribute('aria-disabled', 'false');
    expect(button).toHaveAttribute('aria-live', 'assertive');
    expect(button).toHaveClass('pgn__stateful-btn');
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('btn-primary');
  });

  it('renders button with correct attributes and classes with singlePaidMode', () => {
    const { getByRole } = render(<EnrollmentButton {...defaultProps} singlePaidMode={{ mode: 'paid' }} />);

    const button = getByRole('button', {
      name: messages.enrollNowBtn.defaultMessage,
    });

    expect(button).toHaveAttribute('aria-disabled', 'false');
    expect(button).toHaveAttribute('aria-live', 'assertive');
    expect(button).toHaveClass('pgn__stateful-btn');
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('btn-outline-primary');
  });

  it('handles keyboard interaction for accessibility', async () => {
    const { getByRole } = render(<EnrollmentButton {...defaultProps} />);

    const button = getByRole('button', {
      name: messages.enrollNowBtn.defaultMessage,
    });

    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(defaultProps.onEnroll).toHaveBeenCalledTimes(1);
  });
});
