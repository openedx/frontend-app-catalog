import { Link } from 'react-router-dom';
import {
  Badge, Card, breakpoints, useMediaQuery,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import messages from './messages';
import type { PathwayCardProps } from './types';
import { getFullImageUrl, getStartDateDisplay } from '../course-card/utils';

export const PathwayCard = ({
  isLoading,
  pathwayId,
  pathwayName,
  pathwayOrg,
  pathwayCourseCount,
  pathwayImageUrl,
  pathwayStartDate,
  pathwayAdvertisedStart,
}: PathwayCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const startDateDisplay = (pathwayStartDate || pathwayAdvertisedStart)
    ? getStartDateDisplay({
      start: pathwayStartDate,
      advertisedStart: pathwayAdvertisedStart,
    }, intl)
    : null;

  return (
    <Card
      as={pathwayId ? Link : 'div'}
      to={pathwayId ? `/pathways/${pathwayId}/about` : undefined}
      // TODO: Temporary use of `d-flex` to fix alignment. Remove once the related Paragon issue
      // (https://github.com/openedx/paragon/issues/3792) is resolved.
      className={`pathway-card d-flex ${isExtraSmall ? 'w-100' : 'pathway-card-desktop'}`}
      isClickable={!isLoading}
      isLoading={isLoading}
      data-testid="pathway-card"
    >
      <Card.ImageCap
        src={getFullImageUrl(pathwayImageUrl)}
        fallbackSrc={noCourseImg}
        srcAlt={pathwayName}
        skeletonDuringImageLoad
      />
      <Card.Header
        title={pathwayName}
        subtitle={(
          <>
            <div>
              {pathwayCourseCount !== undefined && intl.formatMessage(messages.courseCount, {
                count: pathwayCourseCount,
              })}
            </div>
            <Badge variant="light">{pathwayOrg}</Badge>
          </>
        )}
        size="sm"
      />
      <Card.Section />
      <Card.Footer
        textElement={startDateDisplay && intl.formatMessage(messages.startDate, {
          startDate: startDateDisplay,
        })}
      />
    </Card>
  );
};
