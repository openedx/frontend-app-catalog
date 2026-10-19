import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Layout, Stack } from '@openedx/paragon';
import { getSiteConfig, useIntl } from '@openedx/frontend-base';

import { PathwayAboutSection } from './PathwayAboutSection';
import { PathwayCredentialsSection } from './PathwayCredentialsSection';
import { PathwayHero } from './PathwayHero';
import { PathwayNavigation } from './PathwayNavigation';
import { PathwaySidebar } from './PathwaySidebar';
import { getPathwayDetail } from './data';
import messages from './messages';
import { usePathwayNavigation } from './hooks/usePathwayNavigation';

/**
 * Responsive Bootstrap grid config for the two page columns, mirroring
 * CourseAboutPage's Layout usage: stacked on mobile, 9/3 split at lg and up.
 */
const PAGE_LAYOUT = {
  xs: [{ span: 12 }, { span: 12 }],
  sm: [{ span: 12 }, { span: 12 }],
  md: [{ span: 12 }, { span: 12 }],
  lg: [{ span: 9 }, { span: 3 }],
  xl: [{ span: 9 }, { span: 3 }],
};

const PathwayDetailPage = () => {
  const intl = useIntl();
  const { pathwayId } = useParams<{ pathwayId: string }>();
  const { activeSection, isNavSticky, selectSection } = usePathwayNavigation();

  const pathway = pathwayId ? getPathwayDetail(pathwayId) : undefined;

  if (!pathway) {
    return (
      <Container size="sm">
        <p className="my-0 py-5 text-muted text-center mx-auto" data-testid="not-found-page">
          {intl.formatMessage(messages.notFound)}
        </p>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.pageTitle, {
            pathwayName: pathway.name,
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
      <Container fluid={false} size="xl" className="pathway-detail-page">
        <PathwayHero pathway={pathway} isNavSticky={isNavSticky} />
        <PathwayNavigation
          pathway={pathway}
          activeSection={activeSection}
          isNavSticky={isNavSticky}
          onSelectSection={selectSection}
        />
        <Layout {...PAGE_LAYOUT}>
          <Layout.Element className="d-flex flex-column gap-5 mt-4 mb-4 mb-lg-0">
            <Stack direction="vertical" gap={5}>
              <PathwayAboutSection pathway={pathway} />
              <PathwayCredentialsSection pathway={pathway} />
            </Stack>
          </Layout.Element>
          <Layout.Element className="align-self-start mt-lg-4">
            <PathwaySidebar pathway={pathway} />
          </Layout.Element>
        </Layout>
      </Container>
    </>
  );
};

export default PathwayDetailPage;
