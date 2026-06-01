import { Helmet } from 'react-helmet';
import { getSiteConfig, useIntl } from '@openedx/frontend-base';

import HomeBannerSlot from '@src/slots/HomeBannerSlot';
import HomeCoursesListSlot from '@src/slots/HomeCoursesListSlot';

import messages from './messages';

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Helmet>
        <title>
          {formatMessage(messages.pageTitle, {
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
      <HomeBannerSlot />
      <HomeCoursesListSlot />
    </>
  );
};

export default HomePage;
