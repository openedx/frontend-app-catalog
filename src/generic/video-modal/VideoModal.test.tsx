import { render, userEvent, cleanup } from '@src/setupTest';
import { DEFAULT_VIDEO_MODAL_HEIGHT } from '@src/constants';
import { VideoModal } from '.';

import messages from './messages';

const videoModalProps = {
  slotId: 'some_slot_id',
  isOpen: true,
  close: jest.fn(),
  videoID: 'some_id',
};

describe('<VideoModal />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders modal with correct title and iframe when open', () => {
    const { getByTitle } = render(<VideoModal {...videoModalProps} />);
    const iframe = getByTitle(messages.videoIframeTitle.defaultMessage);

    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining(videoModalProps.videoID));
  });

  it('does not render modal when isOpen is false', () => {
    const { queryByTitle } = render(<VideoModal {...videoModalProps} isOpen={false} />);

    expect(queryByTitle(messages.videoIframeTitle.defaultMessage)).not.toBeInTheDocument();
  });

  it('calls close function when esc is pressed (if supported)', async () => {
    render(<VideoModal {...videoModalProps} />);

    await userEvent.keyboard('{Escape}');
    expect(videoModalProps.close).toHaveBeenCalledTimes(1);
  });

  it('renders iframe with correct attributes', () => {
    const { getByTitle } = render(<VideoModal {...videoModalProps} />);
    const iframe = getByTitle(messages.videoIframeTitle.defaultMessage);

    expect(iframe).toHaveAttribute('width', 'auto');
    expect(iframe).toHaveAttribute('height', String(DEFAULT_VIDEO_MODAL_HEIGHT));
    expect(iframe).toHaveAttribute('frameBorder', '0');
    expect(iframe).toHaveAttribute('allowFullScreen');
  });
});
