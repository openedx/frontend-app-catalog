import { Slot, useIntl } from '@openedx/frontend-base';

import { DEFAULT_VIDEO_MODAL_HEIGHT, DEFAULT_VIDEO_MODAL_WIDTH, IFRAME_FEATURE_POLICY } from '@src/constants';
import messages from '@src/generic/video-modal/messages';

export interface CourseAboutIntroVideoModalContentSlotProps {
  videoId: string;
  width?: string;
  height?: number;
}

export const CourseAboutIntroVideoModalContentSlot = ({
  videoId,
  width = DEFAULT_VIDEO_MODAL_WIDTH,
  height = DEFAULT_VIDEO_MODAL_HEIGHT,
}: CourseAboutIntroVideoModalContentSlotProps) => {
  const intl = useIntl();

  return (
    <Slot
      id="org.openedx.frontend.slot.catalog.courseAboutIntroVideoModalContent.v1"
      videoId={videoId}
      width={width}
      height={height}
    >
      <iframe
        title={intl.formatMessage(messages.videoIframeTitle)}
        width={width}
        height={height}
        src={`//www.youtube.com/embed/${videoId}?showinfo=0`}
        frameBorder="0"
        allowFullScreen
        allow={IFRAME_FEATURE_POLICY}
      />
    </Slot>
  );
};
