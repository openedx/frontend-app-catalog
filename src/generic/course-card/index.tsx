import { Link } from 'react-router-dom';
import { Card, useMediaQuery, breakpoints } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import noCourseImg from '@src/assets/images/no-course-image.svg';
import noOrgImg from '@src/assets/images/no-org-image.svg';

import { CourseCardProps } from './types';
import messages from './messages';
import { getFullImageUrl } from './utils';
import { DATE_FORMAT_OPTIONS } from './constants';

// TODO: Determine the final design for the course Card component.
// Issue: https://github.com/openedx/frontend-app-catalog/issues/10
export const CourseCard = ({ course }: CourseCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  const formattedDate = course?.data?.start
    ? intl.formatDate(new Date(course.data.start), DATE_FORMAT_OPTIONS)
    : '';

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
        srcAlt={course.data.content.displayName}
        logoSrc={course.data.orgImg ? getFullImageUrl(course.data.orgImg) : undefined}
        fallbackLogoSrc={!course.data.orgImg && noOrgImg}
        logoAlt={course.data.org}
      />
      <Card.Section>
        <h3 className="m-0">{course.data.content.displayName}</h3>
        <p className="m-0">{course.data.org}</p>
        {formattedDate && (
          <span>
            {intl.formatMessage(messages.startDate, {
              startDate: formattedDate,
            })}
          </span>
        )}
      </Card.Section>
    </Card>
  );
};
