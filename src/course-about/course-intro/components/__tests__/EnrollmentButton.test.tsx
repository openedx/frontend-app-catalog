import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@openedx/frontend-base';

import messages from '../../messages';
import { EnrollmentButton } from '../EnrollmentButton';

const user = userEvent.setup();

const renderEnrollmentButton = (props: React.ComponentProps<typeof EnrollmentButton>) => render(
  <IntlProvider locale="en"><EnrollmentButton {...props} /></IntlProvider>,
);

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
    renderEnrollmentButton(defaultProps);
    expect(screen.getByText(messages.enrollNowBtn.defaultMessage)).toBeInTheDocument();
  });

  it('shows pending text when enrollment is pending', () => {
    renderEnrollmentButton({ ...defaultProps, isEnrollmentPending: true });
    expect(screen.getByRole('button', {
      name: messages.enrollNowBtnPending.defaultMessage,
    })).toBeInTheDocument();
  });

  it('calls onEnroll when clicked in default mode', async () => {
    renderEnrollmentButton(defaultProps);

    await user.click(screen.getByText(messages.enrollNowBtn.defaultMessage));
    expect(defaultProps.onEnroll).toHaveBeenCalledTimes(1);
  });

  it('calls onEcommerceCheckout when clicked in ecommerce mode', async () => {
    renderEnrollmentButton({ ...defaultProps, ecommerceCheckout: true });

    await user.click(screen.getByText(messages.enrollNowBtn.defaultMessage));
    expect(defaultProps.onEcommerceCheckout).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEnroll).not.toHaveBeenCalled();
  });

  it('renders button with correct attributes and classes', () => {
    renderEnrollmentButton(defaultProps);

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
    renderEnrollmentButton({ ...defaultProps, singlePaidMode: { mode: 'paid' } });

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
    renderEnrollmentButton(defaultProps);

    const enrollNowBtn = screen.getByRole('button', {
      name: messages.enrollNowBtn.defaultMessage,
    });

    await user.tab();
    expect(enrollNowBtn).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(defaultProps.onEnroll).toHaveBeenCalledTimes(1);
  });
});
