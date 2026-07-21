import { Slot } from '@openedx/frontend-base';

import HomeBanner from '@src/home/components/home-banner/HomeBanner';

const HomeBannerSlot = () => (
  <Slot id="org.openedx.frontend.slot.catalog.homeBanner.v1">
    <HomeBanner />
  </Slot>
);

export default HomeBannerSlot;
