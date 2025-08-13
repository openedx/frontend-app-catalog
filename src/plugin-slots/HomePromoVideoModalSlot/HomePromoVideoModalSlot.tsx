import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { VideoModal } from '@src/generic';
import { VideoModalProps } from '@src/generic/video-modal/types';

const HomePromoVideoModalSlot = ({ isOpen, close, videoID }: VideoModalProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.home_page.promo_video_modal"
    idAliases={['home_page_promo_video_modal_slot']}
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      isOpen,
      close,
      videoID,
    }}
  >
    <VideoModal isOpen={isOpen} close={close} videoID={videoID} />
  </PluginSlot>
);

export default HomePromoVideoModalSlot;
