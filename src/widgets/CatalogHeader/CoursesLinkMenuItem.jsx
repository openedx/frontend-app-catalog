import { LinkMenuItem, getSiteConfig, useIntl } from '@openedx/frontend-base';

import messages from './messages';

export default function CoursesLinkMenuItem({ variant = 'hyperlink' }) {
  const { formatMessage } = useIntl();
  const url = `${getSiteConfig().lmsBaseUrl}/dashboard`;

  return (
    <LinkMenuItem
      label={formatMessage(messages.courses)}
      url={url}
      variant={variant}
    />
  );
}
