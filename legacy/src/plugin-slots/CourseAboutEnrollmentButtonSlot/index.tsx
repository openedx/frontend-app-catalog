import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { EnrollmentButton } from '@src/course-about/course-intro/components';
import type { EnrollmentButtonTypes } from '@src/course-about/course-intro/components/types';

const CourseAboutEnrollmentButtonSlot = ({
  singlePaidMode,
  ecommerceCheckout,
  isEnrollmentPending,
  onEnroll,
  onEcommerceCheckout,
}: EnrollmentButtonTypes) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_about_page.enrollment_button"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      singlePaidMode,
      ecommerceCheckout,
      isEnrollmentPending,
      onEnroll,
      onEcommerceCheckout,
    }}
  >
    <EnrollmentButton
      singlePaidMode={singlePaidMode}
      ecommerceCheckout={ecommerceCheckout}
      isEnrollmentPending={isEnrollmentPending}
      onEnroll={onEnroll}
      onEcommerceCheckout={onEcommerceCheckout}
    />
  </PluginSlot>
);

export default CourseAboutEnrollmentButtonSlot;
