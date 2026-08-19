export interface PathwayCardProps {
  isLoading?: boolean;
  pathwayId?: string;
  name?: string;
  org?: string;
  courseCount?: number;
  imageUrl?: string;
  startDate?: string;
  advertisedStart?: string;
  type?: string;
  typeBackgroundColor?: string;
  typeTextColor?: string;
}

export interface PathwayContent {
  displayName: string;
}

export interface PathwayData {
  org: string;
  courseCount: number;
  imageUrl?: string;
  start?: string;
  advertisedStart?: string;
  type?: string;
  typeBackgroundColor?: string;
  typeTextColor?: string;
  content: PathwayContent;
}

export interface Pathway {
  id: string;
  index?: string;
  type?: string;
  data: PathwayData;
}
