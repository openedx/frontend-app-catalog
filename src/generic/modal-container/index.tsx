import { ModalDialog } from '@openedx/paragon';

import { ModalContainerProps } from './types';

export const ModalContainer = ({
  title, isOpen, close, size = 'md', children,
}: ModalContainerProps) => (
  <ModalDialog
    title={title}
    isOpen={isOpen}
    onClose={close}
    size={size}
    hasCloseButton
    isFullscreenOnMobile
    isOverflowVisible={false}
  >
    <ModalDialog.Header>
      <ModalDialog.Title>
        {title}
      </ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body>
      {children}
    </ModalDialog.Body>
    <ModalDialog.Footer>
      <ModalDialog.CloseButton variant="tertiary">
        Cancel
      </ModalDialog.CloseButton>
    </ModalDialog.Footer>
  </ModalDialog>
);
