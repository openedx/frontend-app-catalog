import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { Button, Icon } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { PlayCircleFilledWhite as PlayCircleFilledWhiteIcon } from '@openedx/paragon/icons';

import messages from '@src/course-about/course-intro/course-media/messages';
import CourseAboutCourseImageSlot from '@src/plugin-slots/CourseAboutCourseImageSlot';
import type { CourseAboutIntroVideoButtonSlotProps } from './types';

export const CourseAboutIntroVideoButtonSlot = ({
  courseImageSrc, courseImageAltText, openVideoModal,
}: CourseAboutIntroVideoButtonSlotProps) => {
  const intl = useIntl();

  return (
    <PluginSlot
      id="org.openedx.frontend.catalog.course_about_page.intro_video_button"
      slotOptions={{
        mergeProps: true,
      }}
      pluginProps={{
        courseImageSrc,
        courseImageAltText,
        openVideoModal,
      }}
    >
      <Button
        className="border-0 p-0 position-relative"
        onClick={openVideoModal}
        aria-label={intl.formatMessage(messages.playCourseIntroductionVideo)}
      >
        <CourseAboutCourseImageSlot imgSrc={courseImageSrc} altText={courseImageAltText} />
        <Icon
          className="position-absolute"
          src={PlayCircleFilledWhiteIcon}
          size="lg"
        />
      </Button>
    </PluginSlot>
  );
};
