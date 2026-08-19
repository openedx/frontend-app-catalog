import { getConfig } from '@edx/frontend-platform';
import { Link } from 'react-router-dom';
import {
  Badge, Card, breakpoints, useMediaQuery,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import noCourseImg from '@src/assets/images/no-course-image.svg';
import { isValidCssColor } from '@src/utils';

import messages from './messages';
import type { PathwayCardProps } from './types';
import { getFullImageUrl, getStartDateDisplay } from '../course-card/utils';

export const PathwayCard = ({
  isLoading,
  pathwayId,
  name,
  org,
  courseCount,
  imageUrl,
  startDate,
  advertisedStart,
  type,
  typeBackgroundColor,
  typeTextColor,
}: PathwayCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const startDateDisplay = (startDate || advertisedStart)
    ? getStartDateDisplay({
      start: startDate,
      advertisedStart,
    }, intl)
    : null;

  const hasCustomColors = !!typeBackgroundColor
    && !!typeTextColor
    && isValidCssColor(typeBackgroundColor)
    && isValidCssColor(typeTextColor);

  return (
    <Card
      as={pathwayId ? Link : 'div'}
      to={pathwayId ? `/pathways/${pathwayId}` : undefined}
      // TODO: Temporary use of `d-flex` to fix alignment. Remove once the related Paragon issue
      // (https://github.com/openedx/paragon/issues/3792) is resolved.
      className={`pathway-card d-flex ${isExtraSmall ? 'w-100' : 'pathway-card-desktop'}`}
      isClickable={!isLoading}
      isLoading={isLoading}
      data-testid="pathway-card"
    >
      <Card.ImageCap
        src={getFullImageUrl(imageUrl)}
        fallbackSrc={noCourseImg}
        srcAlt={name}
        skeletonDuringImageLoad
      />
      {!isLoading && getConfig().ENABLE_PATHWAY_PILOT_UI && type?.trim() && (
        <Badge
          className="catalog-card-badge pathway-card-badge position-absolute py-1 px-2"
          style={hasCustomColors ? {
            backgroundColor: typeBackgroundColor,
            color: typeTextColor,
          } : undefined}
        >
          {type}
        </Badge>
      )}
      <Card.Header
        title={name}
        subtitle={(
          <>
            <div>
              {courseCount !== undefined && intl.formatMessage(messages.courseCount, {
                count: courseCount,
              })}
            </div>
            <Badge variant="light">{org}</Badge>
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
