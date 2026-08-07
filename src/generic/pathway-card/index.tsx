import { getConfig } from '@edx/frontend-platform';
import { Link } from 'react-router-dom';
import {
  Badge, Card, breakpoints, useMediaQuery,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import messages from './messages';
import type { PathwayCardProps } from './types';
import { getFullImageUrl, getStartDateDisplay } from '../course-card/utils';

const isValidCssColor = (value: string) => {
  try {
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
      return CSS.supports('color', value);
    }

    if (typeof document === 'undefined') {
      return false;
    }

    const element = document.createElement('span');
    element.style.color = '';
    element.style.color = value;
    return element.style.color !== '';
  } catch {
    return false;
  }
};

export const PathwayCard = ({
  isLoading,
  pathwayId,
  pathwayName,
  pathwayOrg,
  pathwayCourseCount,
  pathwayImageUrl,
  pathwayStartDate,
  pathwayAdvertisedStart,
  pathwayType,
  pathwayTypeBackgroundColor,
  pathwayTypeTextColor,
}: PathwayCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const startDateDisplay = (pathwayStartDate || pathwayAdvertisedStart)
    ? getStartDateDisplay({
      start: pathwayStartDate,
      advertisedStart: pathwayAdvertisedStart,
    }, intl)
    : null;

  const hasCustomColors = !!pathwayTypeBackgroundColor
    && !!pathwayTypeTextColor
    && isValidCssColor(pathwayTypeBackgroundColor)
    && isValidCssColor(pathwayTypeTextColor);

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
        src={getFullImageUrl(pathwayImageUrl)}
        fallbackSrc={noCourseImg}
        srcAlt={pathwayName}
        skeletonDuringImageLoad
      />
      {!isLoading && getConfig().ENABLE_PATHWAY_PILOT_UI && pathwayType?.trim() && (
        <Badge
          className="catalog-card-badge pathway-card-badge position-absolute py-1 px-2"
          style={hasCustomColors ? {
            backgroundColor: pathwayTypeBackgroundColor,
            color: pathwayTypeTextColor,
          } : undefined}
        >
          {pathwayType}
        </Badge>
      )}
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
