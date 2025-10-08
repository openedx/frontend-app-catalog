import {
  Info as InfoIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon,
} from '@openedx/paragon/icons';

export const STATUS_MESSAGE_VARIANTS = {
  SUCCESS: 'success',
  INFO: 'info',
  DANGER: 'danger',
} as const;

export const STATUS_MESSAGE_ICONS = {
  [STATUS_MESSAGE_VARIANTS.SUCCESS]: CheckCircleIcon,
  [STATUS_MESSAGE_VARIANTS.INFO]: InfoIcon,
  [STATUS_MESSAGE_VARIANTS.DANGER]: ErrorIcon,
} as const;
