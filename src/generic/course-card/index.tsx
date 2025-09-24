import { Link } from 'react-router-dom';
import {
  Card, useMediaQuery, breakpoints, Badge,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import { CourseCardProps } from './types';
import messages from './messages';
import { getFullImageUrl, getStartDateDisplay } from './utils';

// TODO: Determine the final design for the course Card component.
// Issue: https://github.com/openedx/frontend-app-catalog/issues/10
export const CourseCard = ({ course, isLoading }: CourseCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  const startDateDisplay = course ? getStartDateDisplay(course, intl) : null;

  return (
    <Card
      as={course ? Link : 'div'}
      to={course ? `/courses/${course?.id}/about` : undefined}
      // TODO: Temporary use of `d-flex` to fix alignment. Remove once the related Paragon issue
      // (https://github.com/openedx/paragon/issues/3792) is resolved.
      className={`course-card d-flex ${isExtraSmall ? 'w-100' : 'course-card-desktop'}`}
      isClickable={!isLoading}
      isLoading={isLoading}
      data-testid="course-card"
    >
      <Card.ImageCap
        src={getFullImageUrl(course?.data.imageUrl)}
        fallbackSrc={noCourseImg}
        srcAlt={`${course?.data.content.displayName} ${course?.data.number}`}
      />
      <Card.Header
        title={course?.data.content.displayName}
        subtitle={(
          <>
            <div>{course?.data.number}</div>
            <Badge variant="light">{course?.data.org}</Badge>
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
