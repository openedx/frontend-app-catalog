import { Slot } from '@openedx/frontend-base';

import { VideoModal } from '@src/generic';
import { CourseAboutIntroVideoModalContentSlot } from '../CourseAboutIntroVideoModalContentSlot';

export interface CourseAboutIntroVideoModalSlotProps {
  isOpen: boolean;
  close: () => void;
  videoId: string;
}

export const CourseAboutIntroVideoModalSlot = ({ isOpen, close, videoId }: CourseAboutIntroVideoModalSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutIntroVideoModal.v1"
    isOpen={isOpen}
    close={close}
    videoId={videoId}
  >
    <VideoModal isOpen={isOpen} close={close}>
      <CourseAboutIntroVideoModalContentSlot videoId={videoId} />
    </VideoModal>
  </Slot>
);
