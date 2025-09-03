import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { VideoModal } from '@src/generic';
import { VideoModalProps } from '@src/generic/video-modal/types';

type HomePromoVideoModalSlotProps = Omit<VideoModalProps, 'slotId'>;

const HOME_PROMO_VIDEO_MODAL_SLOT_ID = 'org.openedx.frontend.catalog.home_page.promo_video_modal';

const HomePromoVideoModalSlot = ({ isOpen, close, videoID }: HomePromoVideoModalSlotProps) => (
  <PluginSlot
    id={HOME_PROMO_VIDEO_MODAL_SLOT_ID}
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      isOpen,
      close,
      videoID,
    }}
  >
    <VideoModal
      slotId={`${HOME_PROMO_VIDEO_MODAL_SLOT_ID}_content`}
      isOpen={isOpen}
      close={close}
      videoID={videoID}
    />
  </PluginSlot>
);

export default HomePromoVideoModalSlot;
