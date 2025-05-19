export interface ModalContainerProps {
  title: string;
  isOpen: boolean;
  close: () => void;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
