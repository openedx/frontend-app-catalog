import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { VideoModalProps } from '@src/generic/video-modal/types';
import { IFRAME_FEATURE_POLICY } from '@src/constants';

type VideoModalContentSlotProps = Omit<VideoModalProps, 'isOpen' | 'close'> & {
  title: string;
};

const VideoModalContentSlot = ({
  slotId, title, width, height, videoID,
}: VideoModalContentSlotProps) => (
  <PluginSlot
    id={slotId}
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      title,
      width,
      height,
      videoID,
    }}
  >
    <iframe
      title={title}
      width={width}
      height={height}
      src={`//www.youtube.com/embed/${videoID}?showinfo=0`}
      frameBorder="0"
      allowFullScreen
      allow={IFRAME_FEATURE_POLICY}
    />
  </PluginSlot>
);

export default VideoModalContentSlot;
