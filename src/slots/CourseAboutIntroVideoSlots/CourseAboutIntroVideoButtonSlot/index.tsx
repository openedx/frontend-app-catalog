import { Button, Icon } from '@openedx/paragon';
import { useIntl } from '@openedx/frontend-base';
import { PlayCircleFilledWhite as PlayCircleFilledWhiteIcon } from '@openedx/paragon/icons';

import messages from '@src/course-about/course-intro/course-media/messages';
import CourseAboutCourseImageSlot from '@src/slots/CourseAboutCourseImageSlot';
import type { CourseAboutIntroVideoButtonSlotProps } from './types';

export const CourseAboutIntroVideoButtonSlot = ({
  courseImageSrc, courseImageAltText, openVideoModal,
}: CourseAboutIntroVideoButtonSlotProps) => {
  const intl = useIntl();

  return (
    <>
      <Button
        className="border-0 p-0 position-relative"
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
    </>
  );
};
