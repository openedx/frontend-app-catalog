import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { getConfig } from '@edx/frontend-platform';

import HomePromoVideoBtn from '@src/home/components/home-banner/HomePromoVideoBtn';
import { HomePromoVideoBtnProps } from '@src/home/components/home-banner/types';

const HomePromoVideoButtonSlot = ({ onClick }: HomePromoVideoBtnProps) => (
  getConfig().HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID ? (
    <PluginSlot
      id="org.openedx.frontend.catalog.home_page.promo_video_button"
      idAliases={['home_page_promo_video_button_slot']}
      slotOptions={{
        mergeProps: true,
      }}
      pluginProps={{
        onClick,
      }}
    >
      <HomePromoVideoBtn onClick={onClick} />
    </PluginSlot>
  ) : null);

export default HomePromoVideoButtonSlot;
