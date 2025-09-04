export interface VideoModalProps {
  pluginSlotComponent: React.ReactNode;
  isOpen: boolean;
  close: () => void,
  size?: 'sm' | 'md' | 'lg',
}
