import { Card, Stack } from '@openedx/paragon';
import { useIntl } from '@openedx/frontend-base';

import { getShareLinks, ShareLinks, type ShareCopy } from '@src/generic/share-links';

import messages from './messages';
import type { PathwayDetailData } from './types';

interface PathwaySidebarProps {
  pathway: PathwayDetailData;
}

export const PathwaySidebar = ({ pathway }: PathwaySidebarProps) => {
  const intl = useIntl();

  // Built during render with a current-page target, so hash changes synced by
  // the section observer are reflected in the destinations.
  const socialCopy: ShareCopy = {
    twitterLabel: intl.formatMessage(messages.shareTwitterLabel),
    facebookLabel: intl.formatMessage(messages.shareFacebookLabel),
    emailLabel: intl.formatMessage(messages.shareEmailLabel),
    twitterText: url => intl.formatMessage(messages.shareTwitterText, { pathwayName: pathway.name, url }),
    emailSubject: intl.formatMessage(messages.shareEmailSubject, { pathwayName: pathway.name }),
    emailBody: url => intl.formatMessage(messages.shareEmailBody, { pathwayName: pathway.name, url }),
  };
  const { links: socialLinks } = getShareLinks(socialCopy, { kind: 'current-page' });

  return (
    <aside aria-label={intl.formatMessage(messages.factsAriaLabel)}>
      <Card>
        <Card.Body className="p-0">
          <div
            role="group"
            aria-label={intl.formatMessage(messages.shareHeading)}
            className="p-3"
          >
            <Stack direction="horizontal" gap={3} className="justify-content-center">
              <ShareLinks links={socialLinks} />
            </Stack>
          </div>
          <Card.Divider />
          {pathway.facts.map((fact) => (
            <div key={fact.label}>
              <Stack direction="horizontal" className="justify-content-between flex-wrap p-3" gap={2}>
                <span>{fact.label}</span>
                <span className="font-weight-bold">{fact.value}</span>
              </Stack>
              <Card.Divider />
            </div>
          ))}
        </Card.Body>
      </Card>
    </aside>
  );
};
