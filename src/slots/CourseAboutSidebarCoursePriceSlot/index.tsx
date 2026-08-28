import { MoneyFilled as MoneyFilledIcon } from '@openedx/paragon/icons';
import { Slot, useIntl } from '@openedx/frontend-base';

import type { CourseAboutData } from '@src/course-about/types';
import SidebarDetailsItem from '@src/course-about/course-sidebar/sidebar-details/SidebarDetailsItem';
import messages from '@src/course-about/course-sidebar/sidebar-details/messages';

export interface CourseAboutSidebarCoursePriceSlotProps {
  coursePrice: CourseAboutData['coursePrice'];
}

const CourseAboutSidebarCoursePriceSlot = ({ coursePrice }: CourseAboutSidebarCoursePriceSlotProps) => {
  const intl = useIntl();

  return (
    <Slot
      id="org.openedx.frontend.slot.catalog.courseAboutSidebarCoursePrice.v1"
      coursePrice={coursePrice}
    >
      <SidebarDetailsItem
        key="price"
        icon={MoneyFilledIcon}
        label={intl.formatMessage(messages.price)}
        value={coursePrice}
      />
    </Slot>
  );
};

export default CourseAboutSidebarCoursePriceSlot;
