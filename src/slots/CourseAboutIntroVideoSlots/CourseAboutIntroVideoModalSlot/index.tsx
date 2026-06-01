import { VideoModal } from '@src/generic';
import { CourseAboutIntroVideoModalContentSlot } from '../CourseAboutIntroVideoModalContentSlot';
import type { CourseAboutIntroVideoModalSlotProps } from './types';

export const CourseAboutIntroVideoModalSlot = ({ isOpen, close, videoId }: CourseAboutIntroVideoModalSlotProps) => (
  <>
    <VideoModal isOpen={isOpen} close={close}>
      <CourseAboutIntroVideoModalContentSlot videoId={videoId} />
    </VideoModal>
  </>
);
