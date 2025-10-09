import { useMemo } from 'react';
import { Stack, Icon } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import { STATUS_MESSAGE_ICONS, STATUS_MESSAGE_VARIANTS } from '../constants';
import type { StatusMessageTypes } from './types';

export const StatusMessage = ({ variant, messageKey }: StatusMessageTypes) => {
  const intl = useIntl();

  const icon = useMemo(
    () => STATUS_MESSAGE_ICONS[variant] || STATUS_MESSAGE_ICONS[STATUS_MESSAGE_VARIANTS.INFO],
    [variant],
  );

  return (
    <Stack role="status" direction="horizontal" gap={2} className={`text-${variant}-500 h4`}>
      <Icon src={icon} />
      {intl.formatMessage(messages[messageKey])}
    </Stack>
  );
};
