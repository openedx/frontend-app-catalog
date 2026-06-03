import { getAppConfig, Slot } from '@openedx/frontend-base';

import { appId } from '@src/constants';
import HomePromoVideoBtn from '@src/home/components/home-banner/HomePromoVideoBtn';
import type { HomePromoVideoBtnProps } from '@src/home/components/home-banner/types';

export const HomePromoVideoButtonSlot = ({ onClick }: HomePromoVideoBtnProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.homePromoVideoButton.v1"
    onClick={onClick}
  >
    {getAppConfig(appId).HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID
      ? <HomePromoVideoBtn onClick={onClick} />
      : null}
  </Slot>
);
