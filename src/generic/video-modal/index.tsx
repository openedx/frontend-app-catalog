import { useIntl } from '@edx/frontend-platform/i18n';
import { ModalDialog } from '@openedx/paragon';

import { DEFAULT_VIDEO_MODAL_SIZE } from '@src/constants';
import { VideoModalProps } from './types';
import messages from './messages';

export const VideoModal = ({
  pluginSlotComponent, isOpen, close, size = DEFAULT_VIDEO_MODAL_SIZE,
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
      {pluginSlotComponent}
    </ModalDialog>
  );
};
