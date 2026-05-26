import { getCatalogConfig } from '@src/data/appConfig';
import HomePromoVideoBtn from '@src/home/components/home-banner/HomePromoVideoBtn';
import type { HomePromoVideoBtnProps } from '@src/home/components/home-banner/types';

export const HomePromoVideoButtonSlot = ({ onClick }: HomePromoVideoBtnProps) => (
  <>
    {getCatalogConfig().HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID
      ? <HomePromoVideoBtn onClick={onClick} />
      : null}
  </>
);
