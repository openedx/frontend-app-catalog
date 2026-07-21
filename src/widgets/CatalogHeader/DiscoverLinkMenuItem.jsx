import { LinkMenuItem, useIntl } from '@openedx/frontend-base';

import { coursesRole } from '../../constants';
import messages from './messages';

export default function DiscoverLinkMenuItem({ variant = 'hyperlink' }) {
  const { formatMessage } = useIntl();

  return (
    <LinkMenuItem
      label={formatMessage(messages.discoverNew)}
      role={coursesRole}
      variant={variant}
    />
  );
}
