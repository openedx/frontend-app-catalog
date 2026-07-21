import { getAppConfig, Slot } from '@openedx/frontend-base';

import { appId } from '@src/constants';
import HomePromoVideoBtn from '@src/home/components/home-banner/HomePromoVideoBtn';

export interface HomePromoVideoButtonSlotProps {
  onClick: () => void,
}

export const HomePromoVideoButtonSlot = ({ onClick }: HomePromoVideoButtonSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.homePromoVideoButton.v1"
    onClick={onClick}
  >
    {getAppConfig(appId).HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID
      ? <HomePromoVideoBtn onClick={onClick} />
      : null}
  </Slot>
);
