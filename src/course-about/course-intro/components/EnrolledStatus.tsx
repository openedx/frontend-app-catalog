import {
  breakpoints, Button, Stack, useMediaQuery,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { getLearningHomePageUrl } from '../utils';
import messages from '../messages';
import { ALERT_VARIANTS } from '../constants';
import { EnrolledStatusTypes } from './types';
import { StatusAlert } from './StatusAlert';

export const EnrolledStatus = ({ showCoursewareLink, courseId }: EnrolledStatusTypes) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  return (
    <Stack direction={isExtraSmall ? 'vertical' : 'horizontal'} gap={isExtraSmall ? 2 : 5}>
      <StatusAlert
        variant={ALERT_VARIANTS.SUCCESS}
        messageKey="statusAlertEnrolled"
      />
      {showCoursewareLink && (
        <Button as="a" href={getLearningHomePageUrl(courseId)}>
          {intl.formatMessage(messages.viewCourseBtn)}
        </Button>
      )}
    </Stack>
  );
};
