import { Link } from 'react-router-dom';
import {
  Card, useMediaQuery, breakpoints, Badge,
} from '@openedx/paragon';
import { getAppConfig, resolveRouteByRole, useIntl } from '@openedx/frontend-base';

import { appId, courseAboutRole } from '@src/constants';

import { IMAGE_PLACEHOLDER, resolveImageUrl } from '../course-image';
import type { CourseCardProps } from './types';
import messages from './messages';
import { getStartDateDisplay } from './utils';

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

  const courseAboutUrl = courseId
    ? resolveRouteByRole(courseAboutRole, { courseId })?.url
    : undefined;

  return (
    <Card
      as={courseAboutUrl ? Link : 'div'}
      to={courseAboutUrl}
      // TODO: Temporary use of `d-flex` to fix alignment. Remove once the related Paragon issue
      // (https://github.com/openedx/paragon/issues/3792) is resolved.
      className={`d-flex ${isExtraSmall ? 'w-100' : ''}`}
      isClickable={!isLoading}
      isLoading={isLoading}
      data-testid="course-card"
    >
      <Card.ImageCap
        src={resolveImageUrl(courseImageUrl)}
        fallbackSrc={IMAGE_PLACEHOLDER}
        srcAlt={`${courseName} ${courseNumber}`}
        skeletonDuringImageLoad
      />
      {!isLoading && getAppConfig(appId).ENABLE_PATHWAY_PILOT_UI === true && (
        <Badge
          className="catalog-card-badge course-card-badge position-absolute py-1 px-2"
        >
          {intl.formatMessage(messages.course)}
        </Badge>
      )}
      <Card.Header
        title={(
          <>
            <div className="catalog-card-org">{courseOrg}</div>
            {courseName}
          </>
        )}
        subtitle={courseNumber}
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
