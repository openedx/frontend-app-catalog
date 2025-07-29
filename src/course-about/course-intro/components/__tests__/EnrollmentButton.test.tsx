import { render, userEvent, screen } from '@src/setupTest';
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
    render(<EnrollmentButton {...defaultProps} />);
    expect(screen.getByText(messages.enrollNowBtn.defaultMessage)).toBeInTheDocument();
  });

  it('shows pending text when enrollment is pending', () => {
    render(<EnrollmentButton {...defaultProps} isEnrollmentPending />);
    expect(screen.getByRole('button', {
      name: messages.enrollNowBtnPending.defaultMessage,
    })).toBeInTheDocument();
  });

  it('calls onEnroll when clicked in default mode', async () => {
    render(<EnrollmentButton {...defaultProps} />);

    await user.click(screen.getByText(messages.enrollNowBtn.defaultMessage));
    expect(defaultProps.onEnroll).toHaveBeenCalledTimes(1);
  });

  it('calls onEcommerceCheckout when clicked in ecommerce mode', async () => {
    render(<EnrollmentButton {...defaultProps} ecommerceCheckout />);

    await user.click(screen.getByText(messages.enrollNowBtn.defaultMessage));
    expect(defaultProps.onEcommerceCheckout).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEnroll).not.toHaveBeenCalled();
  });

  it('renders button with correct attributes and classes', () => {
    render(<EnrollmentButton {...defaultProps} />);

    const enrollNowBtn = screen.getByRole('button', {
      name: messages.enrollNowBtn.defaultMessage,
    });

    expect(enrollNowBtn).toHaveAttribute('aria-disabled', 'false');
    expect(enrollNowBtn).toHaveAttribute('aria-live', 'assertive');
    expect(enrollNowBtn).toHaveClass('pgn__stateful-btn');
    expect(enrollNowBtn).toHaveClass('btn');
    expect(enrollNowBtn).toHaveClass('btn-primary');
  });

  it('renders button with correct attributes and classes with singlePaidMode', () => {
    render(<EnrollmentButton {...defaultProps} singlePaidMode={{ mode: 'paid' }} />);

    const enrollNowBtn = screen.getByRole('button', {
      name: messages.enrollNowBtn.defaultMessage,
    });

    expect(enrollNowBtn).toHaveAttribute('aria-disabled', 'false');
    expect(enrollNowBtn).toHaveAttribute('aria-live', 'assertive');
    expect(enrollNowBtn).toHaveClass('pgn__stateful-btn');
    expect(enrollNowBtn).toHaveClass('btn');
    expect(enrollNowBtn).toHaveClass('btn-outline-primary');
  });

  it('handles keyboard interaction for accessibility', async () => {
    render(<EnrollmentButton {...defaultProps} />);

    const enrollNowBtn = screen.getByRole('button', {
      name: messages.enrollNowBtn.defaultMessage,
    });

    await user.tab();
    expect(enrollNowBtn).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(defaultProps.onEnroll).toHaveBeenCalledTimes(1);
  });
});
