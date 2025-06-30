import { HomeSettingsResponse } from '../../data/types';

export type HomeBannerProps = Partial<Pick<
HomeSettingsResponse,
'homepageOverlayHtml' |
'showHomepagePromoVideo' |
'homepagePromoVideoYoutubeId' |
'enableCourseDiscovery'
>>;
