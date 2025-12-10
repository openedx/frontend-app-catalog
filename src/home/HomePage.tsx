import { Head } from '@src/generic';
import HomeBannerSlot from '../plugin-slots/HomeBannerSlot';
import HomeCoursesListSlot from '../plugin-slots/HomeCoursesListSlot';

const HomePage = () => (
  <>
    <Head />
    <HomeBannerSlot />
    <HomeCoursesListSlot />
  </>
);

export default HomePage;
