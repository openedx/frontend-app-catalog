import {
  breakpoints, Button, Stack, useMediaQuery,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { getLearningHomePageUrl } from '../utils';
import messages from '../messages';
import { STATUS_MESSAGE_VARIANTS } from '../constants';
import type { EnrolledStatusTypes } from './types';
import { StatusMessage } from './StatusMessage';

export const EnrolledStatus = ({ showCoursewareLink, courseId }: EnrolledStatusTypes) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  return (
    <Stack direction={isExtraSmall ? 'vertical' : 'horizontal'} gap={isExtraSmall ? 2 : 5}>
      <StatusMessage
        variant={STATUS_MESSAGE_VARIANTS.SUCCESS}
        messageKey="statusMessageEnrolled"
      />
      {showCoursewareLink && (
        <Button as="a" href={getLearningHomePageUrl(courseId)}>
          {intl.formatMessage(messages.viewCourseBtn)}
        </Button>
      )}
    </Stack>
  );
};
