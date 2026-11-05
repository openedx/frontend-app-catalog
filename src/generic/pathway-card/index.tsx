import { Link } from 'react-router-dom';
import { FormattedMessage, resolveRouteByRole, useIntl } from '@openedx/frontend-base';
import {
  Badge, Card, Icon, Stack, breakpoints, useMediaQuery,
} from '@openedx/paragon';
import { FormatListBulleted } from '@openedx/paragon/icons';

import { pathwayDetailRole } from '@src/constants';
import { isValidCssColor } from '@src/utils';

import { IMAGE_PLACEHOLDER, resolveImageUrl } from '../course-image';
import messages from './messages';
import type { PathwayCardProps } from './types';
import { getStartDateDisplay } from '../course-card/utils';

export const PathwayCard = ({
  isLoading,
  pathwayId,
  name,
  org,
  itemCount,
  imageUrl,
  startDate,
  advertisedStart,
  categoryLabel,
  categoryBackgroundColor,
  categoryTextColor,
}: PathwayCardProps) => {
  const intl = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.small.maxWidth });
  const startDateDisplay = (startDate || advertisedStart)
    ? getStartDateDisplay({
        start: startDate,
        advertisedStart,
      }, intl)
    : null;

  const pathwayDetailUrl = pathwayId
    ? resolveRouteByRole(pathwayDetailRole, { pathwayId })?.url
    : undefined;

  const hasCustomColors = !!categoryBackgroundColor
    && !!categoryTextColor
    && isValidCssColor(categoryBackgroundColor)
    && isValidCssColor(categoryTextColor);

  return (
    <Card
      as={pathwayDetailUrl ? Link : 'div'}
      to={pathwayDetailUrl}
      // TODO: Temporary use of `d-flex` to fix alignment. Remove once the related Paragon issue
      // (https://github.com/openedx/paragon/issues/3792) is resolved.
      className={`d-flex ${isExtraSmall ? 'w-100' : ''}`}
      isClickable={!isLoading}
      isLoading={isLoading}
      data-testid="pathway-card"
    >
      <Card.ImageCap
        src={resolveImageUrl(imageUrl)}
        fallbackSrc={IMAGE_PLACEHOLDER}
        srcAlt={name}
        skeletonDuringImageLoad
      />
      {(categoryLabel || '').trim() && (
        <Badge
          className="catalog-card-badge pathway-card-badge position-absolute py-1 px-2"
          style={hasCustomColors ? {
            backgroundColor: categoryBackgroundColor,
            color: categoryTextColor,
          } : undefined}
        >
          {categoryLabel}
        </Badge>
      )}
      <Card.Header
        title={(
          <>
            <div className="catalog-card-org">{org}</div>
            {name}
          </>
        )}
        subtitle={itemCount !== undefined && (
          <Stack gap={1} direction="horizontal">
            <Icon size="sm" src={FormatListBulleted} />
            <FormattedMessage {...messages.courseCount} values={{ count: itemCount }} />
          </Stack>
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
