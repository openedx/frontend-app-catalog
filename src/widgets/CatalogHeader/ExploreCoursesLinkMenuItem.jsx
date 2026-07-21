import { LinkMenuItem, useIntl } from '@openedx/frontend-base';

import { coursesRole } from '../../constants';
import messages from './messages';

export default function ExploreCoursesLinkMenuItem({ variant = 'hyperlink' }) {
  const { formatMessage } = useIntl();

  return (
    <LinkMenuItem
      label={formatMessage(messages.exploreCourses)}
      role={coursesRole}
      variant={variant}
    />
  );
}
