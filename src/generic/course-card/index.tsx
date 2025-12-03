import { Link } from 'react-router-dom';
import {
  Card, useMediaQuery, breakpoints, Badge,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import type { CourseCardProps } from './types';
import messages from './messages';
import { getFullImageUrl, getStartDateDisplay } from './utils';

export const CourseCard = ({
  isLoading,
  courseId,
  courseOrg,
  courseName,
  courseNumber,
  courseImageUrl,
  courseStartDate,
  courseAdvertisedStart,
}: CourseCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  const startDateDisplay = (courseStartDate || courseAdvertisedStart) ? getStartDateDisplay({
    start: courseStartDate,
    advertisedStart: courseAdvertisedStart,
  }, intl) : null;

  return (
    <Card
      as={courseId ? Link : 'div'}
      to={courseId ? `/courses/${courseId}/about` : undefined}
      // TODO: Temporary use of `d-flex` to fix alignment. Remove once the related Paragon issue
      // (https://github.com/openedx/paragon/issues/3792) is resolved.
      className={`course-card d-flex ${isExtraSmall ? 'w-100' : 'course-card-desktop'}`}
      isClickable={!isLoading}
      isLoading={isLoading}
      data-testid="course-card"
    >
      <Card.ImageCap
        src={getFullImageUrl(courseImageUrl)}
        fallbackSrc={noCourseImg}
        srcAlt={`${courseName} ${courseNumber}`}
        skeletonDuringImageLoad
      />
      <Card.Header
        title={courseName}
        subtitle={(
          <>
            <div>{courseNumber}</div>
            <Badge variant="light">{courseOrg}</Badge>
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
