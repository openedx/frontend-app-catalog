import { useIntl } from '@edx/frontend-platform/i18n';
import { ModalDialog } from '@openedx/paragon';

import { DEFAULT_VIDEO_MODAL_HEIGHT } from '@src/constants';
import VideoModalContentSlot from '@src/plugin-slots/VideoModalContentSlot';
import { VideoModalProps } from './types';
import messages from './messages';

export const VideoModal = ({
  slotId,
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
      isOpen={isOpen || false}
      onClose={close}
      hasCloseButton={false}
      isOverflowVisible={false}
      className="bg-transparent shadow-none"
    >
      <VideoModalContentSlot
        slotId={slotId}
        title={intl.formatMessage(messages.videoIframeTitle)}
        width={width}
        height={height}
        videoID={videoID}
      />
    </ModalDialog>
  );
};
