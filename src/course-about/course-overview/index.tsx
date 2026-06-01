import {
  Button, Container, useMediaQuery, breakpoints, Card, ActionRow,
} from '@openedx/paragon';
import {
  getAuthenticatedUser, getSiteConfig, useIntl,
} from '@openedx/frontend-base';

import messages from '../messages';
import type { CourseOverviewProps } from './types';
import { processOverviewContent } from './utils';

export const CourseOverview = ({ overviewData, courseId }: CourseOverviewProps) => {
  const intl = useIntl();
  const authenticatedUser = getAuthenticatedUser();
  const isGlobalStaff = authenticatedUser?.administrator || false;
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });

  const processedOverviewData = processOverviewContent(overviewData, getSiteConfig().lmsBaseUrl);
  const hasOverviewContent = processedOverviewData.trim().length > 0;

  if (!hasOverviewContent) {
    if (!isGlobalStaff) {
      return null;
    }

    return (
      <ActionRow>
        <Button
          as="a"
          size="sm"
          block={isExtraSmall}
          variant="outline-primary"
          href={`${getSiteConfig().cmsBaseUrl}/settings/details/${courseId}`}
        >
          {intl.formatMessage(messages.viewAboutPageInStudio)}
        </Button>
      </ActionRow>
    );
  }

  return (
    <Container className="px-0">
      <Card>
        {isGlobalStaff && (
          <Card.Header
            actions={(
              <ActionRow>
                <Button
                  as="a"
                  size="sm"
                  block={isExtraSmall}
                  variant="outline-primary"
                  href={`${getSiteConfig().cmsBaseUrl}/settings/details/${courseId}`}
                >
                  {intl.formatMessage(messages.viewAboutPageInStudio)}
                </Button>
              </ActionRow>
            )}
          />
        )}
        <Card.Section>
          <div className="course-about-overview" dangerouslySetInnerHTML={{ __html: processedOverviewData }} />
        </Card.Section>
      </Card>
    </Container>
  );
};
