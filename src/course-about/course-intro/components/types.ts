import { ALERT_VARIANTS } from '../constants';

export type AlertVariant = typeof ALERT_VARIANTS[keyof typeof ALERT_VARIANTS];

export interface EnrollmentButtonTypes {
  singlePaidMode: {};
  ecommerceCheckout: boolean;
  isEnrollmentPending: boolean;
  onEnroll: () => void;
  onEcommerceCheckout: () => void;
}

export interface EnrolledStatusTypes {
  showCoursewareLink: boolean;
  courseId: string;
}

export interface StatusAlertTypes {
  variant: AlertVariant;
  messageKey: string;
}
