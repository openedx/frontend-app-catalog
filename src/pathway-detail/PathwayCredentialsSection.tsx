import { useState } from 'react';
import { Button, Card, Icon } from '@openedx/paragon';
import {
  ExpandLess,
  ExpandMore,
  WorkspacePremium,
} from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@openedx/frontend-base';

import { CertificateIcon } from './icons';
import { INITIAL_VISIBLE_COUNT } from './sections';
import messages from './messages';
import type { PathwayCredential, PathwayDetailData } from './types';

interface PathwayCredentialCardProps {
  credential: PathwayCredential;
}

/** One credential a learner can earn; the pathway-level certificate card is separate. */
const PathwayCredentialCard = ({ credential }: PathwayCredentialCardProps) => {
  const isBadge = credential.kind === 'badge';

  return (
    <Card
      className={`pathway-detail-credential-card justify-content-center border-0 ${isBadge
        ? 'bg-primary-100'
        : 'bg-light-100'}`}
    >
      <Card.Body className="d-flex flex-column align-items-center text-center p-4">
        {isBadge
          ? <Icon src={WorkspacePremium} size="lg" className="text-info-800 mb-3" />
          : <CertificateIcon aria-hidden className="mb-3" />}
        <strong>
          <FormattedMessage
            {...(isBadge ? messages.earnBadgeTitle : messages.earnCertificateTitle)}
            values={{ rule: credential.rule }}
          />
        </strong>
        <span className="small">
          <FormattedMessage {...messages.credentialCourseTitle} values={{ title: credential.courseTitle }} />
        </span>
      </Card.Body>
    </Card>
  );
};

interface PathwayCredentialsSectionProps {
  pathway: PathwayDetailData;
}

export const PathwayCredentialsSection = ({ pathway }: PathwayCredentialsSectionProps) => {
  const intl = useIntl();
  const [showAllCredentials, setShowAllCredentials] = useState(false);
  const visibleCredentials = pathway.credentials.slice(0, showAllCredentials ? undefined : INITIAL_VISIBLE_COUNT);

  return (
    <section id="credentials" className="pathway-detail-section d-flex flex-column gap-3">
      <h2 className="h3 mb-3">{intl.formatMessage(messages.credentialsHeading)}</h2>
      <div id="pathway-credentials-list" className="pathway-detail-credentials">
        {pathway.certificateLabel && (
          <Card className="pathway-detail-featured-credential d-flex rounded bg-primary-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
              <CertificateIcon aria-hidden className="mb-3 mt-2" />
              <strong className="mb-1">{pathway.name}</strong>
              <span className="small">{pathway.certificateLabel}</span>
            </Card.Body>
          </Card>
        )}
        {visibleCredentials.map((credential) => (
          <PathwayCredentialCard key={credential.id} credential={credential} />
        ))}
      </div>
      {pathway.credentials.length > INITIAL_VISIBLE_COUNT && (
        <div className="d-flex justify-content-center">
          <Button
            variant="link"
            className="text-body"
            aria-expanded={showAllCredentials}
            aria-controls="pathway-credentials-list"
            iconAfter={showAllCredentials ? ExpandLess : ExpandMore}
            onClick={() => setShowAllCredentials((current) => !current)}
          >
            {intl.formatMessage(showAllCredentials ? messages.seeLessBtn : messages.seeMoreBtn)}
          </Button>
        </div>
      )}
    </section>
  );
};
