import { getAppConfig } from '@openedx/frontend-base';

import { appId } from '@src/constants';

export interface CatalogAppConfig {
  ENABLE_COURSE_DISCOVERY: boolean,
  ENABLE_PROGRAMS: boolean,
  HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID: string,
  HOMEPAGE_COURSE_MAX: number,
  ENABLE_COURSE_SORTING_BY_START_DATE: boolean,
  NON_BROWSABLE_COURSES: string,
  SUPPORT_URL: string,
  INFO_EMAIL: string,
  COURSE_ABOUT_TWITTER_ACCOUNT: string,
}

export const getCatalogConfig = (): CatalogAppConfig => getAppConfig(appId) as unknown as CatalogAppConfig;
