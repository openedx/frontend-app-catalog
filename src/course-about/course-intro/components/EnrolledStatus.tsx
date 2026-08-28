import {
  breakpoints, Button, Stack, useMediaQuery,
} from '@openedx/paragon';
import { useIntl } from '@openedx/frontend-base';

import { getLearningHomePageUrl } from '../utils';
import messages from '../messages';
import { STATUS_MESSAGE_VARIANTS } from '../constants';
import type { EnrolledStatusTypes } from './types';
import { StatusMessage } from './StatusMessage';

export const EnrolledStatus = ({ showCoursewareLink, courseId }: EnrolledStatusTypes) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const learningHomePageUrl = getLearningHomePageUrl(courseId);

  return (
    <Stack direction={isExtraSmall ? 'vertical' : 'horizontal'} gap={isExtraSmall ? 2 : 5}>
      <StatusMessage
        variant={STATUS_MESSAGE_VARIANTS.SUCCESS}
        messageKey="statusMessageEnrolled"
      />
      {showCoursewareLink && learningHomePageUrl && (
        <Button as="a" href={learningHomePageUrl}>
          {intl.formatMessage(messages.viewCourseBtn)}
        </Button>
      )}
    </Stack>
  );
};
