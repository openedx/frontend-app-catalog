import { Slot } from '@openedx/frontend-base';

import HomePageOverlay from '@src/home/components/home-banner/HomePageOverlay';

const HomeOverlayHtmlSlot = () => (
  <Slot id="org.openedx.frontend.slot.catalog.homeOverlayHtml.v1">
    <HomePageOverlay />
  </Slot>
);

export default HomeOverlayHtmlSlot;
