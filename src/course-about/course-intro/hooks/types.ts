import { User } from '@edx/frontend-platform/auth';

import type { CourseAboutDataPartial } from '../../types';

export interface UseEnrollmentActionsTypes {
  courseId: string;
  ecommerceCheckoutLink?: string | null;
}

export interface UseEnrollmentStatusTypes {
  courseAboutData: CourseAboutDataPartial;
  authenticatedUser: User;
  enrollmentError: string | null;
  isEnrollmentPending: boolean;
  handleChangeEnrollment: () => void;
  handleEcommerceCheckout: () => void;
}
