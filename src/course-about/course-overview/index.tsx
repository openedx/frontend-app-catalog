import {
  Button, Container, useMediaQuery, breakpoints, Card, ActionRow,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import classNames from 'classnames';

import messages from '../messages';
import type { CourseOverviewProps } from './types';
import { processOverviewContent } from './utils';

export const CourseOverview = ({ overviewData, courseId }: CourseOverviewProps) => {
  const intl = useIntl();
  const authenticatedUser = getAuthenticatedUser();
  const isGlobalStaff = authenticatedUser?.administrator || false;
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });

  const processedOverviewData = processOverviewContent(overviewData, getConfig().LMS_BASE_URL);
  const hasOverviewContent = processedOverviewData.trim().length > 0;

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
                  href={`${getConfig().STUDIO_BASE_URL}/settings/details/${courseId}`}
                >
                  {intl.formatMessage(messages.viewAboutPageInStudio)}
                </Button>
              </ActionRow>
            )}
          />
        )}
        <Card.Section>
          {hasOverviewContent ? (
            /* eslint-disable-next-line react/no-danger */
            <div dangerouslySetInnerHTML={{ __html: processedOverviewData }} />
          ) : (
            <div className={classNames('text-center', isGlobalStaff ? 'mb-5.5' : 'my-5.5')}>
              <p className="m-0">{intl.formatMessage(messages.noCourseOverview)}</p>
            </div>
          )}
        </Card.Section>
      </Card>
    </Container>
  );
};
