import type { ReactNode } from 'react';

export interface FrontendParamsResponse {
  homepageOverlayHtml: string | null,
  showHomepagePromoVideo: boolean,
  homepagePromoVideoYoutubeId: string,
  enableCourseDiscovery: boolean,
  enableCourseSortingByStartDate: boolean,
  showPartners: boolean,
  homepageCourseMax: number,
}

export interface FrontendParamsContextType {
  data: FrontendParamsResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
}

export interface FrontendParamsProviderProps {
  children: ReactNode;
}
