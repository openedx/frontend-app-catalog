export interface VideoModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  close: () => void,
  size?: 'sm' | 'md' | 'lg',
}
