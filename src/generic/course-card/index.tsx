import { Link } from 'react-router-dom';
import { Card, useMediaQuery, breakpoints } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import { CourseCardProps } from './types';
import messages from './messages';
import { getFullImageUrl, getStartDateDisplay } from './utils';

// TODO: Determine the final design for the course Card component.
// Issue: https://github.com/openedx/frontend-app-catalog/issues/10
export const CourseCard = ({ course }: CourseCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  const startDateDisplay = getStartDateDisplay(course, intl);

  return (
    <Card
      as={Link}
      to={`/courses/${course.id}/about`}
      className={`course-card ${isExtraSmall ? 'w-100' : 'course-card-desktop'}`}
      isClickable
    >
      <Card.ImageCap
        src={getFullImageUrl(course.data.imageUrl)}
        fallbackSrc={noCourseImg}
        srcAlt={`${course.data.content.displayName} ${course.data.number}`}
      />
      <Card.Header
        title={course.data.content.displayName}
        subtitle={(
          <>
            <div>{course.data.number}</div>
            <div>{course.data.org}</div>
          </>
        )}
        size="sm"
      />
      <Card.Section />
      <Card.Footer textElement={startDateDisplay && intl.formatMessage(messages.startDate, {
        startDate: startDateDisplay,
      })}
      />
    </Card>
  );
};
