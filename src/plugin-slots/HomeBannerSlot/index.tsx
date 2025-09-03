import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HomeBanner from '@src/home/components/home-banner/HomeBanner';

const HomeBannerSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.catalog.home_page.banner"
    slotOptions={{
      mergeProps: true,
    }}
  >
    <HomeBanner />
  </PluginSlot>
);

export default HomeBannerSlot;
