import { EnrollmentButton } from '@src/course-about/course-intro/components';
import type { EnrollmentButtonTypes } from '@src/course-about/course-intro/components/types';

const CourseAboutEnrollmentButtonSlot = ({
  singlePaidMode,
  ecommerceCheckout,
  isEnrollmentPending,
  onEnroll,
  onEcommerceCheckout,
}: EnrollmentButtonTypes) => (
  <>
    <EnrollmentButton
      singlePaidMode={singlePaidMode}
      ecommerceCheckout={ecommerceCheckout}
      isEnrollmentPending={isEnrollmentPending}
      onEnroll={onEnroll}
      onEcommerceCheckout={onEcommerceCheckout}
    />
  </>
);

export default CourseAboutEnrollmentButtonSlot;
