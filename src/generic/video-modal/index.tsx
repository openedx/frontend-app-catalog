import { useIntl } from '@edx/frontend-platform/i18n';
import { ModalDialog } from '@openedx/paragon';

import { DEFAULT_VIDEO_MODAL_HEIGHT, IFRAME_FEATURE_POLICY } from '../../constants';
import { VideoModalProps } from './types';
import messages from './messages';

export const VideoModal = ({
  isOpen,
  close,
  videoID,
  size = 'lg',
  height = DEFAULT_VIDEO_MODAL_HEIGHT,
  width = 'auto',
}: VideoModalProps) => {
  const intl = useIntl();

  return (
    <ModalDialog
      title={intl.formatMessage(messages.videoModalTitle)}
      size={size}
      isOpen={isOpen}
      onClose={close}
      hasCloseButton={false}
      isOverflowVisible={false}
      className="video-modal"
    >
      <iframe
        title={intl.formatMessage(messages.videoIframeTitle)}
        width={width}
        height={height}
        src={`//www.youtube.com/embed/${videoID}?showinfo=0`}
        frameBorder="0"
        allowFullScreen
        allow={IFRAME_FEATURE_POLICY}
      />
    </ModalDialog>
  );
};
