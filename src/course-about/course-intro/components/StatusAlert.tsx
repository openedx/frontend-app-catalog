import { useMemo } from 'react';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import { ALERT_ICONS, ALERT_VARIANTS } from '../constants';
import { StatusAlertTypes } from './types';

export const StatusAlert = ({ variant, messageKey }: StatusAlertTypes) => {
  const intl = useIntl();

  const icon = useMemo(() => ALERT_ICONS[variant] || ALERT_ICONS[ALERT_VARIANTS.INFO], [variant]);

  return (
    <Alert
      className="p-0 my-0 shadow-none bg-transparent"
      variant={variant}
      icon={icon}
    >
      <Alert.Heading>{intl.formatMessage(messages[messageKey])}</Alert.Heading>
    </Alert>
  );
};
