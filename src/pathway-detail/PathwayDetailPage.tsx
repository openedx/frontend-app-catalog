import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Alert, Container, Layout, Stack,
} from '@openedx/paragon';
import { getSiteConfig, useIntl } from '@openedx/frontend-base';

import { getStringConfig } from '@src/config';
import { Loading } from '@src/generic';

import { PathwayAboutSection } from './PathwayAboutSection';
import { PathwayCredentialsSection } from './PathwayCredentialsSection';
import { PathwayHero } from './PathwayHero';
import { PathwayNavigation } from './PathwayNavigation';
import { PathwaySidebar } from './PathwaySidebar';
import { usePathwayDetail } from './data/hooks';
import messages from './messages';
import { usePathwayNavigation } from './hooks/usePathwayNavigation';
import type { PathwayDetailData } from './types';

/**
 * Responsive Bootstrap grid config for the two page columns: stacked on mobile,
 * 8/1/3 at lg and up, where the sidebar's one-column offset is the gap.
 */
const PAGE_LAYOUT = {
  xs: [{ span: 12 }, { span: 12 }],
  sm: [{ span: 12 }, { span: 12 }],
  md: [{ span: 12 }, { span: 12 }],
  lg: [{ span: 8 }, { span: 3, offset: 1 }],
  xl: [{ span: 8 }, { span: 3, offset: 1 }],
};

/**
 * The loaded page. Split from the route component so the navigation hook mounts
 * in the same commit as the sections it observes: mounted any earlier, it would
 * find no sections and would never attach.
 */
const PathwayDetail = ({ pathway }: { pathway: PathwayDetailData }) => {
  const intl = useIntl();
  const { activeSection, isNavSticky, selectSection } = usePathwayNavigation();

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

const PathwayDetailPage = () => {
  const intl = useIntl();
  const { pathwayId } = useParams<{ pathwayId: string }>();
  const { data: pathway, isPending, isError } = usePathwayDetail(pathwayId ?? '');

  const notFound = (
    <Container size="sm">
      <p className="my-0 py-5 text-muted text-center mx-auto" data-testid="not-found-page">
        {intl.formatMessage(messages.notFound)}
      </p>
    </Container>
  );

  // A blank id never starts a query, so it must not wait on a pending one.
  if (!pathwayId?.trim()) {
    return notFound;
  }

  if (isPending) {
    return <Loading />;
  }

  // A failed refresh keeps the cached pathway; only a failure with nothing to
  // show replaces the page with an error.
  if (isError && !pathway) {
    return (
      <Container size="sm">
        <Alert variant="danger" className="my-5" data-testid="pathway-error">
          {intl.formatMessage(messages.errorMessage, {
            supportEmail: getStringConfig('INFO_EMAIL'),
          })}
        </Alert>
      </Container>
    );
  }

  if (!pathway) {
    return notFound;
  }

  // Keyed by record: a cached pathway switch replaces the navigation refs and
  // expanded sections instead of carrying the previous pathway's state over.
  return <PathwayDetail key={pathway.id} pathway={pathway} />;
};

export default PathwayDetailPage;
