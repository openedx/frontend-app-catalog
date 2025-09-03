export interface VideoModalProps {
  slotId: string;
  isOpen: boolean;
  close: () => void,
  videoID: string,
  size?: 'sm' | 'md' | 'lg',
  width?: number | 'auto',
  height?: number | 'auto',
}
