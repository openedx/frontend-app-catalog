import { STATUS_MESSAGE_VARIANTS } from '../constants';
import type { SinglePaidMode } from '../../types';

export type StatusMessageVariant = typeof STATUS_MESSAGE_VARIANTS[keyof typeof STATUS_MESSAGE_VARIANTS];

export interface EnrollmentButtonTypes {
  singlePaidMode: SinglePaidMode;
  ecommerceCheckout: boolean;
  isEnrollmentPending: boolean;
  onEnroll: () => void;
  onEcommerceCheckout: () => void;
}

export interface EnrolledStatusTypes {
  showCoursewareLink: boolean;
  courseId: string;
}

export interface StatusMessageTypes {
  variant: StatusMessageVariant;
  messageKey: string;
}
