import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@openedx/frontend-base';

import { DEFAULT_VIDEO_MODAL_SIZE } from '@src/constants';
import { VideoModal } from '.';

import messages from './messages';

const videoModalProps = {
  children: <div data-testid="test-content">Test</div>,
  isOpen: true,
  close: jest.fn(),
  size: 'md' as const,
};

const renderVideoModal = (props: React.ComponentProps<typeof VideoModal>) => render(
  <IntlProvider locale="en"><VideoModal {...props} /></IntlProvider>,
);

describe('<VideoModal />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders modal with correct title and content when open', () => {
    const { getByLabelText, getByTestId } = renderVideoModal(videoModalProps);

    expect(getByLabelText(messages.videoModalTitle.defaultMessage)).toBeInTheDocument();
    expect(getByTestId('test-content')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    const { queryByLabelText } = renderVideoModal({ ...videoModalProps, isOpen: false });

    expect(queryByLabelText(messages.videoModalTitle.defaultMessage)).not.toBeInTheDocument();
  });

  it('calls close function when esc is pressed', async () => {
    renderVideoModal(videoModalProps);

    await userEvent.keyboard('{Escape}');
    expect(videoModalProps.close).toHaveBeenCalledTimes(1);
  });

  it('renders modal with correct size', () => {
    const { getByRole } = renderVideoModal(videoModalProps);
    const modal = getByRole('dialog');

    expect(modal).toHaveClass('pgn__modal-md');
  });

  it('renders modal with default size when not specified', () => {
    const { getByRole } = renderVideoModal({ ...videoModalProps, size: undefined });
    const modal = getByRole('dialog');

    expect(modal).toHaveClass(`pgn__modal-${DEFAULT_VIDEO_MODAL_SIZE}`);
  });
});
