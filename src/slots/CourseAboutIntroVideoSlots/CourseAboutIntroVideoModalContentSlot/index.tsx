import { useIntl } from '@openedx/frontend-base';

import { DEFAULT_VIDEO_MODAL_HEIGHT, DEFAULT_VIDEO_MODAL_WIDTH, IFRAME_FEATURE_POLICY } from '@src/constants';
import messages from '@src/generic/video-modal/messages';
import type { CourseAboutIntroVideoModalContentSlotProps } from './types';

export const CourseAboutIntroVideoModalContentSlot = ({
  videoId,
  width = DEFAULT_VIDEO_MODAL_WIDTH,
  height = DEFAULT_VIDEO_MODAL_HEIGHT,
}: CourseAboutIntroVideoModalContentSlotProps) => {
  const intl = useIntl();

  return (
    <>
      <iframe
        title={intl.formatMessage(messages.videoIframeTitle)}
        width={width}
        height={height}
        src={`//www.youtube.com/embed/${videoId}?showinfo=0`}
        frameBorder="0"
        allowFullScreen
        allow={IFRAME_FEATURE_POLICY}
      />
    </>
  );
};
