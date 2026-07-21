import { LinkMenuItem, getSiteConfig, useIntl } from '@openedx/frontend-base';

import messages from './messages';

export default function ProgramsLinkMenuItem({ variant = 'hyperlink' }) {
  const { formatMessage } = useIntl();
  const url = `${getSiteConfig().lmsBaseUrl}/dashboard/programs`;

  return (
    <LinkMenuItem
      label={formatMessage(messages.programs)}
      url={url}
      variant={variant}
    />
  );
}
