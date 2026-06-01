import { MoneyFilled as MoneyFilledIcon } from '@openedx/paragon/icons';
import { useIntl } from '@openedx/frontend-base';

import type { CourseAboutData } from '@src/course-about/types';
import SidebarDetailsItem from '@src/course-about/course-sidebar/sidebar-details/SidebarDetailsItem';
import messages from '@src/course-about/course-sidebar/sidebar-details/messages';

const CourseAboutSidebarCoursePriceSlot = ({ coursePrice }: { coursePrice: CourseAboutData['coursePrice'] }) => {
  const intl = useIntl();

  return (
    <>
      <SidebarDetailsItem
        key="price"
        icon={MoneyFilledIcon}
        label={intl.formatMessage(messages.price)}
        value={coursePrice}
      />
    </>
  );
};

export default CourseAboutSidebarCoursePriceSlot;
