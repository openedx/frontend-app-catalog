import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HomePageOverlay from '@src/home/components/home-banner/HomePageOverlay';

const HomeOverlayHtmlSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.catalog.home_page.overlay_html"
    slotOptions={{
      mergeProps: true,
    }}
  >
    <HomePageOverlay />
  </PluginSlot>
);

export default HomeOverlayHtmlSlot;
