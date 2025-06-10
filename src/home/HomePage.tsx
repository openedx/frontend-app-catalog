import { Alert, Container } from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import { Loading } from '../generic';
import { useHomeSettingsQuery } from './data/hooks';
import HomeBanner from './components/home-banner/HomeBanner';

import messages from './messages';

const HomePage = () => {
  const intl = useIntl();
  const {
    data: {
      homepageOverlayHtml,
      showHomepagePromoVideo,
      homepagePromoVideoYoutubeId,
      enableCourseDiscovery,
    } = {}, isLoading, isError,
  } = useHomeSettingsQuery();

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (isError) {
    return (
      <Container className="py-5.5">
        <Alert variant="danger">
          <ErrorPage
            message={intl.formatMessage(messages.errorMessage, {
              supportEmail: getConfig().INFO_EMAIL,
            })}
          />
        </Alert>
      </Container>
    );
  }

  return (
    <HomeBanner
      homepageOverlayHtml={homepageOverlayHtml || ''}
      showHomepagePromoVideo={showHomepagePromoVideo}
      homepagePromoVideoYoutubeId={homepagePromoVideoYoutubeId}
      enableCourseDiscovery={enableCourseDiscovery}
    />
  );
};

export default HomePage;
