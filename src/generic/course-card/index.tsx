import { Link } from 'react-router-dom';
import { Card, useMediaQuery, breakpoints } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ROUTES } from '../../routes';
import { CourseCardProps } from './types';
import { getFullImageUrl } from './utils';
import { DATE_FORMAT_OPTIONS } from './constants';

import messages from './messages';

import noCourseImg from '../../assets/images/no-course-image.jpg';
import noOrgImg from '../../assets/images/no-org-image.jpg';

export const CourseCard = ({ course }: CourseCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  const formattedDate = course?.data?.start
    ? intl.formatDate(new Date(course.data.start), DATE_FORMAT_OPTIONS)
    : '';

  return (
    <Card
      as={Link}
      to={ROUTES.COURSE_ABOUT.replace(':courseId', course.id)}
      className={`course-card ${isExtraSmall ? 'w-100' : 'course-card-desktop'}`}
      isClickable
    >
      <Card.ImageCap
        src={getFullImageUrl(course.data.imageUrl)}
        fallbackSrc={noCourseImg}
        srcAlt={course.data.content.displayName}
        logoSrc={course.data.orgImg ? getFullImageUrl(course.data.orgImg) : undefined}
        fallbackLogoSrc={course.data.orgImg ? noOrgImg : undefined}
        logoAlt={course.data.org}
      />
      <Card.Header
        title={course.data.content.displayName}
        subtitle={course.data.org}
      />
      {formattedDate && (
        <Card.Footer className="justify-content-start">
          {intl.formatMessage(messages.startDate, {
            startDate: formattedDate,
          })}
        </Card.Footer>
      )}
    </Card>
  );
};
