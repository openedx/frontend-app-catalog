import { render, userEvent, cleanup } from '../../setupTest';
import { VideoModal } from '.';
import messages from './messages';

const videoModalProps = {
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

  it('calls close function when modal backdrop is clicked or esc is pressed (if supported)', async () => {
    render(<VideoModal {...videoModalProps} />);

    await userEvent.keyboard('{Escape}');
    expect(videoModalProps.close).toHaveBeenCalledTimes(1);
  });

  it('renders iframe with correct attributes', () => {
    const { getByTitle } = render(<VideoModal {...videoModalProps} />);
    const iframe = getByTitle(messages.videoIframeTitle.defaultMessage);

    expect(iframe).toHaveAttribute('width', 'auto');
    expect(iframe).toHaveAttribute('height', '500');
    expect(iframe).toHaveAttribute('frameBorder', '0');
    expect(iframe).toHaveAttribute('allowFullScreen');
  });
});
