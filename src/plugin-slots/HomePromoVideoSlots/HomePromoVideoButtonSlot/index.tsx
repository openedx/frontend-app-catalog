import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { getConfig } from '@edx/frontend-platform';

import HomePromoVideoBtn from '@src/home/components/home-banner/HomePromoVideoBtn';
import type { HomePromoVideoBtnProps } from '@src/home/components/home-banner/types';

export const HomePromoVideoButtonSlot = ({ onClick }: HomePromoVideoBtnProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.home_page.promo_video_button"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      onClick,
    }}
  >
    {getConfig().HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID
      ? <HomePromoVideoBtn onClick={onClick} />
      : null}
  </PluginSlot>
);
