import { Button, Icon } from '@openedx/paragon';
import { Slot, useIntl } from '@openedx/frontend-base';
import { PlayCircleFilledWhite as PlayCircleFilledWhiteIcon } from '@openedx/paragon/icons';

import messages from '@src/course-about/course-intro/course-media/messages';
import CourseAboutCourseImageSlot from '@src/slots/CourseAboutCourseImageSlot';

export interface CourseAboutIntroVideoButtonSlotProps {
  courseImageSrc: string,
  courseImageAltText: string,
  openVideoModal: () => void,
}

export const CourseAboutIntroVideoButtonSlot = ({
  courseImageSrc, courseImageAltText, openVideoModal,
}: CourseAboutIntroVideoButtonSlotProps) => {
  const intl = useIntl();

  return (
    <Slot
      id="org.openedx.frontend.slot.catalog.courseAboutIntroVideoButton.v1"
      courseImageSrc={courseImageSrc}
      courseImageAltText={courseImageAltText}
      openVideoModal={openVideoModal}
    >
      <Button
        className="border-0 p-0 position-relative bg-transparent"
        onClick={openVideoModal}
        aria-label={intl.formatMessage(messages.playCourseIntroductionVideo)}
      >
        <CourseAboutCourseImageSlot imgSrc={courseImageSrc} altText={courseImageAltText} />
        <Icon
          className="position-absolute bg-primary rounded-circle"
          src={PlayCircleFilledWhiteIcon}
          size="lg"
        />
      </Button>
    </Slot>
  );
};
