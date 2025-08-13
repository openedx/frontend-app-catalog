import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HomeBanner from '@src/home/components/home-banner/HomeBanner';

const HomeBannerSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.catalog.home_page.banner"
    idAliases={['home_page_banner_slot']}
    slotOptions={{
      mergeProps: true,
    }}
  >
    <HomeBanner />
  </PluginSlot>
);

export default HomeBannerSlot;
