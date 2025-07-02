export interface VideoModalProps {
  isOpen: boolean;
  close: () => void,
  videoID: string,
  size?: 'sm' | 'md' | 'lg',
  width?: number | 'auto',
  height?: number | 'auto',
}
