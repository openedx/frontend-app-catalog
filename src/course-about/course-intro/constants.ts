import { Info as InfoIcon, CheckCircle as CheckCircleIcon } from '@openedx/paragon/icons';

export const ALERT_VARIANTS = {
  SUCCESS: 'success',
  INFO: 'info',
  DANGER: 'danger',
} as const;

export const ALERT_ICONS = {
  [ALERT_VARIANTS.SUCCESS]: CheckCircleIcon,
  [ALERT_VARIANTS.INFO]: InfoIcon,
  [ALERT_VARIANTS.DANGER]: InfoIcon,
} as const;
