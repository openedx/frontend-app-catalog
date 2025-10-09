import { Link } from 'react-router-dom';
import {
  Card, useMediaQuery, breakpoints, Badge,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import type { CourseCardProps } from './types';
import messages from './messages';
import { getFullImageUrl, getStartDateDisplay } from './utils';

export const CourseCard = ({ original: courseData, isLoading }: CourseCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  const startDateDisplay = courseData?.data?.start ? getStartDateDisplay(courseData, intl) : null;

  return (
    <Card
      as={courseData ? Link : 'div'}
      to={courseData ? `/courses/${courseData?.id}/about` : undefined}
      // TODO: Temporary use of `d-flex` to fix alignment. Remove once the related Paragon issue
      // (https://github.com/openedx/paragon/issues/3792) is resolved.
      className={`course-card d-flex ${isExtraSmall ? 'w-100' : 'course-card-desktop'}`}
      isClickable={!isLoading}
      isLoading={isLoading}
      data-testid="course-card"
    >
      <Card.ImageCap
        src={getFullImageUrl(courseData?.data.imageUrl)}
        fallbackSrc={noCourseImg}
        srcAlt={`${courseData?.data.content.displayName} ${courseData?.data.number}`}
      />
      <Card.Header
        title={courseData?.data.content.displayName}
        subtitle={(
          <>
            <div>{courseData?.data.number}</div>
            <Badge variant="light">{courseData?.data.org}</Badge>
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
