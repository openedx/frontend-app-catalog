import {
  Button, Container, useMediaQuery, breakpoints, Card,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import classNames from 'classnames';

import { hasVisibleContent, processOverviewContent } from '../utils';
import messages from '../messages';

export const CourseOverview = ({ overviewData, courseId }: { overviewData: string, courseId: string }) => {
  const intl = useIntl();
  const authenticatedUser = getAuthenticatedUser();
  const isGlobalStaff = authenticatedUser?.administrator || false;
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });

  const processedOverview = processOverviewContent(overviewData, getConfig().LMS_BASE_URL);

  const hasOverviewContent = hasVisibleContent(processedOverview);

  return (
    <Container className="mb-4 px-0">
      <Card>
        <Card.Section>
          {isGlobalStaff && (
            <Button
              as="a"
              size="sm"
              block={isExtraSmall}
              variant="outline-primary"
              href={`${getConfig().STUDIO_BASE_URL}/settings/details/${courseId}`}
              className={classNames(
                'float-right',
                isExtraSmall ? 'mx-0' : 'm-1',
              )}
            >
              {intl.formatMessage(messages.viewAboutPageInStudio)}
            </Button>
          )}
          {hasOverviewContent ? (
            /* eslint-disable-next-line react/no-danger */
            <div className="course-about-overview-content" dangerouslySetInnerHTML={{ __html: processedOverview }} />
          ) : (
            <div className="course-about-no-course-overview text-center">
              <p className="m-0">{intl.formatMessage(messages.noCourseOverview)}</p>
            </div>
          )}
        </Card.Section>
      </Card>
    </Container>
  );
};
