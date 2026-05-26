import { useIntl } from '@edx/frontend-platform/i18n';
import { ModalDialog } from '@openedx/paragon';

import { DEFAULT_VIDEO_MODAL_SIZE } from '@src/constants';
import type { VideoModalProps } from './types';
import messages from './messages';

export const VideoModal = ({
  isOpen, close, size = DEFAULT_VIDEO_MODAL_SIZE, children,
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
      {children}
    </ModalDialog>
  );
};
