import type { CourseAboutDataPartial } from '../../types';

export interface UseEnrollmentActionsTypes {
  courseId: string;
  ecommerceCheckoutLink?: string | null;
}

export interface AuthenticatedUser {
  username: string;
}

export interface UseEnrollmentStatusTypes {
  courseAboutData: CourseAboutDataPartial;
  authenticatedUser: AuthenticatedUser | null;
  enrollmentError: string | null;
  isEnrollmentPending: boolean;
  handleChangeEnrollment: () => void;
  handleEcommerceCheckout: () => void;
}
