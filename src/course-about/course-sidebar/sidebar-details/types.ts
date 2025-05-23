import type { ReactNode, ComponentType } from 'react';

export interface SidebarDetailsItemProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | ReactNode;
}

export interface CourseAboutData {
  displayNumberWithDefault: string;
  startDateIsStillDefault: boolean;
  advertisedStart?: string;
  start?: string;
  end?: string;
  effort?: string;
  coursePrice?: string;
  preRequisiteCourses: Array<{
    key: string;
    display: string;
  }>;
  requirements?: string;
}

export interface SidebarDetailsProps {
  courseAboutData: CourseAboutData;
}
