import { Slot } from '@openedx/frontend-base';

import { VideoModal } from '@src/generic';
import { HomePromoVideoModalContentSlot } from '../HomePromoVideoModalContentSlot';

export interface HomePromoVideoModalSlotProps {
  isOpen: boolean,
  close: () => void,
  videoId: string,
}

export const HomePromoVideoModalSlot = ({ isOpen, close, videoId }: HomePromoVideoModalSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.homePromoVideoModal.v1"
    isOpen={isOpen}
    close={close}
    videoId={videoId}
  >
    <VideoModal isOpen={isOpen} close={close}>
      <HomePromoVideoModalContentSlot videoId={videoId} />
    </VideoModal>
  </Slot>
);
