import { Slot } from '@openedx/frontend-base';

import { EnrollmentButton } from '@src/course-about/course-intro/components';
import type { SinglePaidMode } from '@src/course-about/types';

export interface CourseAboutEnrollmentButtonSlotProps {
  singlePaidMode: SinglePaidMode;
  ecommerceCheckout: boolean;
  isEnrollmentPending: boolean;
  onEnroll: () => void;
  onEcommerceCheckout: () => void;
}

const CourseAboutEnrollmentButtonSlot = ({
  singlePaidMode,
  ecommerceCheckout,
  isEnrollmentPending,
  onEnroll,
  onEcommerceCheckout,
}: CourseAboutEnrollmentButtonSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutEnrollmentButton.v1"
    singlePaidMode={singlePaidMode}
    ecommerceCheckout={ecommerceCheckout}
    isEnrollmentPending={isEnrollmentPending}
    onEnroll={onEnroll}
    onEcommerceCheckout={onEcommerceCheckout}
  >
    <EnrollmentButton
      singlePaidMode={singlePaidMode}
      ecommerceCheckout={ecommerceCheckout}
      isEnrollmentPending={isEnrollmentPending}
      onEnroll={onEnroll}
      onEcommerceCheckout={onEcommerceCheckout}
    />
  </Slot>
);

export default CourseAboutEnrollmentButtonSlot;
