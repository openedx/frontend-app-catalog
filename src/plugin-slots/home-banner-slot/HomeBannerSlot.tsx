import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HomeBanner from '../../home/components/home-banner/HomeBanner';
import { HomeBannerProps } from '../../home/components/home-banner/types';

const HomeBannerSlot = ({
  homepageOverlayHtml,
  showHomepagePromoVideo,
  homepagePromoVideoYoutubeId,
  enableCourseDiscovery,
}: HomeBannerProps) => (
  <PluginSlot
    id="catalog.home_page.home_banner"
    idAliases={['home_banner']}
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      homepageOverlayHtml,
      showHomepagePromoVideo,
      homepagePromoVideoYoutubeId,
      enableCourseDiscovery,
    }}
  >
    <HomeBanner
      homepageOverlayHtml={homepageOverlayHtml}
      showHomepagePromoVideo={showHomepagePromoVideo}
      homepagePromoVideoYoutubeId={homepagePromoVideoYoutubeId}
      enableCourseDiscovery={enableCourseDiscovery}
    />
  </PluginSlot>
);

export default HomeBannerSlot;
