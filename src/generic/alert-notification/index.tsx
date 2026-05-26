import { Alert as BaseAlert } from '@openedx/paragon';
import { Info as InfoIcon } from '@openedx/paragon/icons';

import type { AlertNotificationProps } from './types';

export const AlertNotification = ({
  variant = 'info', title, message, className = '',
}: AlertNotificationProps) => (
  <BaseAlert variant={variant} icon={InfoIcon} className={className}>
    <BaseAlert.Heading>{title}</BaseAlert.Heading>
    <p>{message}</p>
  </BaseAlert>
);
