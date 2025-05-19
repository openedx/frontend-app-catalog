export interface CourseAboutDataTypes {
  id: string;
  name: string;
  org: string;
  shortDescription: string;
  enrollment: {
    isActive: boolean;
  };
  isCourseFull: boolean;
  invitationOnly: boolean;
  canEnroll: boolean;
  isShibCourse: boolean;
  allowAnonymous: boolean;
  showCoursewareLink: boolean;
  singlePaidMode: {};
  ecommerceCheckout: boolean;
  ecommerceCheckoutLink: string | null;
}

export interface CourseIntroTypes {
  courseAboutData: CourseAboutDataTypes;
}

export interface StatusAlertTypes {
  variant: 'info' | 'success' | 'danger';
  messageKey: string;
}

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
