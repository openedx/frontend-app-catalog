import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { VideoModal } from '@src/generic';
import { HomePromoVideoModalContentSlot } from '../HomePromoVideoModalContentSlot';
import type { HomePromoVideoModalSlotProps } from './types';

export const HomePromoVideoModalSlot = ({ isOpen, close, videoId }: HomePromoVideoModalSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.home_page.promo_video_modal"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      isOpen,
      close,
      videoId,
    }}
  >
    <VideoModal isOpen={isOpen} close={close}>
      <HomePromoVideoModalContentSlot videoId={videoId} />
    </VideoModal>
  </PluginSlot>
);
