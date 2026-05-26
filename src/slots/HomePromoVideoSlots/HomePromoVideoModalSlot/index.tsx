import { VideoModal } from '@src/generic';
import { HomePromoVideoModalContentSlot } from '../HomePromoVideoModalContentSlot';
import type { HomePromoVideoModalSlotProps } from './types';

export const HomePromoVideoModalSlot = ({ isOpen, close, videoId }: HomePromoVideoModalSlotProps) => (
  <>
    <VideoModal isOpen={isOpen} close={close}>
      <HomePromoVideoModalContentSlot videoId={videoId} />
    </VideoModal>
  </>
);
