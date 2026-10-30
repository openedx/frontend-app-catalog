import { Badge, Button, Image, Stack } from '@openedx/paragon';
import { useIntl } from '@openedx/frontend-base';

import { onImageLoadError, resolveImageUrl } from '@src/generic/course-image';

import messages from './messages';
import type { PathwayDetailData } from './types';

interface PathwayHeroProps {
  pathway: PathwayDetailData;
  /** Hides the call to action while the sticky bar shows its own. */
  isNavSticky: boolean;
}

export const PathwayHero = ({ pathway, isNavSticky }: PathwayHeroProps) => {
  const intl = useIntl();

  return (
    <header className="pathway-detail-hero d-flex flex-column flex-lg-row align-items-lg-start gap-3 bg-light-200 py-6">
      <div className="pathway-detail-hero-content d-flex flex-column gap-2">
        <h1 className="h2 mb-0">{pathway.name}</h1>
        <Stack direction="horizontal" gap={3}>
          <Badge variant="light">{intl.formatMessage(messages.pathwayBadge)}</Badge>
          <div className="text-muted">{pathway.organization}</div>
        </Stack>
        <p className="mt-3">{pathway.description}</p>
        <div
          className={`pathway-detail-hero-actions mt-1 d-flex flex-column align-items-start ${isNavSticky ? 'invisible' : ''}`}
          aria-hidden={isNavSticky || undefined}
        >
          <Button variant="primary" disabled>
            {intl.formatMessage(pathway.isEnrolled ? messages.viewPathwayBtn : messages.enrollNowBtn)}
          </Button>
        </div>
      </div>
      <Image
        className="pathway-detail-hero-image flex-lg-shrink-0"
        src={resolveImageUrl(pathway.imageUrl)}
        alt={pathway.name}
        onError={onImageLoadError}
      />
    </header>
  );
};
