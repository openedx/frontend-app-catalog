import { Alert as BaseAlert } from '@openedx/paragon';
import { Info as InfoIcon } from '@openedx/paragon/icons';

import { AlertNotificationProps } from './types';

export const AlertNotification = ({
  variant = 'info', title, message,
}: AlertNotificationProps) => (
  <BaseAlert variant={variant} icon={InfoIcon}>
    <BaseAlert.Heading>{title}</BaseAlert.Heading>
    <p>{message}</p>
  </BaseAlert>
);
