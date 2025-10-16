import type { ReactNode, ComponentType } from 'react';

export interface SidebarDetailsItemProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value?: string | ReactNode;
}
