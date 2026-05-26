import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { VideoModal } from '@src/generic';
import { CourseAboutIntroVideoModalContentSlot } from '../CourseAboutIntroVideoModalContentSlot';
import type { CourseAboutIntroVideoModalSlotProps } from './types';

export const CourseAboutIntroVideoModalSlot = ({ isOpen, close, videoId }: CourseAboutIntroVideoModalSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_about_page.intro_video_modal"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      isOpen,
      close,
      videoId,
    }}
  >
    <VideoModal isOpen={isOpen} close={close}>
      <CourseAboutIntroVideoModalContentSlot videoId={videoId} />
    </VideoModal>
  </PluginSlot>
);
