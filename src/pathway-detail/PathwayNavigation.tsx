import { Button, Nav } from '@openedx/paragon';
import { useIntl } from '@openedx/frontend-base';

import type { IntlShape } from '@src/utils';

import { SECTION_NAV_ITEMS } from './sections';
import messages from './messages';
import type { PathwayDetailData } from './types';

/**
 * Localized month/day for the sticky start label, or null when the value is
 * absent or unparseable. UTC keeps an ISO date such as 2027-03-03 from
 * rendering as the previous day in negative-offset timezones.
 */
const formatStart = (intl: IntlShape, start?: string): string | null => {
  if (!start) {
    return null;
  }
  const date = new Date(start);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return intl.formatDate(date, { timeZone: 'UTC', month: 'short', day: 'numeric' });
};

interface PathwayNavigationProps {
  pathway: PathwayDetailData;
  activeSection: string;
  isNavSticky: boolean;
  onSelectSection: (sectionId: string) => void;
}

export const PathwayNavigation = ({
  pathway,
  activeSection,
  isNavSticky,
  onSelectSection,
}: PathwayNavigationProps) => {
  const intl = useIntl();
  const startLabel = formatStart(intl, pathway.start);

  return (
    <div className="pathway-detail-nav position-sticky vw-100 border-bottom border-light-300 mt-1 mb-5">
      {isNavSticky && (
        <div className="pathway-detail-nav-summary d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 pt-3 pb-2">
          <strong className="h4 mb-0">{pathway.name}</strong>
          <div className="d-flex flex-column align-items-center">
            <Button
              className="pathway-detail-nav-cta"
              variant="primary"
              size="md"
              disabled
            >
              {intl.formatMessage(pathway.isEnrolled ? messages.viewPathwayBtn : messages.enrollNowBtn)}
            </Button>
            {startLabel && (
              <span className="small mt-1">
                {intl.formatMessage(messages.startsOn, { date: startLabel })}
              </span>
            )}
          </div>
        </div>
      )}
      <Nav
        as="nav"
        aria-label={intl.formatMessage(messages.sectionsNavLabel)}
        className="pathway-detail-nav-tabs d-flex flex-nowrap gap-4"
      >
        {SECTION_NAV_ITEMS.map(({ id, message }) => (
          <Nav.Link
            key={id}
            href={`#${id}`}
            className={`pathway-detail-nav-link px-0 d-flex align-items-center text-nowrap py-2 ${activeSection === id ? 'active' : ''}`}
            aria-current={activeSection === id ? 'location' : undefined}
            onClick={() => onSelectSection(id)}
          >
            {intl.formatMessage(message)}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};
