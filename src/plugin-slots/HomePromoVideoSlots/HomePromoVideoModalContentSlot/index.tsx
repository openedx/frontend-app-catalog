import { useIntl } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { DEFAULT_VIDEO_MODAL_HEIGHT, DEFAULT_VIDEO_MODAL_WIDTH, IFRAME_FEATURE_POLICY } from '@src/constants';
import messages from '@src/generic/video-modal/messages';
import type { HomePromoVideoModalContentSlotProps } from './types';

export const HomePromoVideoModalContentSlot = ({
  videoId,
  width = DEFAULT_VIDEO_MODAL_WIDTH,
  height = DEFAULT_VIDEO_MODAL_HEIGHT,
}: HomePromoVideoModalContentSlotProps) => {
  const intl = useIntl();

  return (
    <PluginSlot
      id="org.openedx.frontend.catalog.home_page.promo_video_modal_content"
      slotOptions={{ mergeProps: true }}
      pluginProps={{ videoId, width, height }}
    >
      <iframe
        title={intl.formatMessage(messages.videoIframeTitle)}
        width={width}
        height={height}
        src={`//www.youtube.com/embed/${videoId}?showinfo=0`}
        frameBorder="0"
        allowFullScreen
        allow={IFRAME_FEATURE_POLICY}
      />
    </PluginSlot>
  );
};
