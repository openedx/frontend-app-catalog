import { Link } from 'react-router-dom';
import { Card, useMediaQuery, breakpoints } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { CourseCardProps } from './types';
import messages from './messages';
import { getFullImageUrl } from './utils';
import { DATE_FORMAT_OPTIONS } from './constants';

import noCourseImg from '../../assets/no-course-image.svg';
import noOrgImg from '../../assets/no-org-image.svg';

// TODO: Determine the final design for the course Card component.
// Issue: https://github.com/openedx/frontend-app-catalog/issues/10
export const CourseCard = ({ original }: CourseCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });

  const formattedDate = original?.data?.start
    ? intl.formatDate(new Date(original.data.start), DATE_FORMAT_OPTIONS)
    : '';

  return (
    <Card
      as={Link}
      to={`/courses/${original.id}/about`}
      className={`course-card ${isExtraSmall ? 'w-100' : 'course-card-desktop'}`}
      isClickable
    >
      <Card.ImageCap
        src={getFullImageUrl(original.data.imageUrl)}
        fallbackSrc={noCourseImg}
        srcAlt={original.data.content.displayName}
        logoSrc={original.data.orgImg ? getFullImageUrl(original.data.orgImg) : undefined}
        fallbackLogoSrc={!original.data.orgImg && noOrgImg}
        logoAlt={original.data.org}
      />
      <Card.Section>
        <h3 className="m-0">{original.data.content.displayName}</h3>
        <p className="m-0">{original.data.org}</p>
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
