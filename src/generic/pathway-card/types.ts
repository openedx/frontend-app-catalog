export interface PathwayCardProps {
  isLoading?: boolean;
  pathwayId?: string;
  pathwayName?: string;
  pathwayOrg?: string;
  pathwayCourseCount?: number;
  pathwayImageUrl?: string;
  pathwayStartDate?: string;
  pathwayAdvertisedStart?: string;
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
  content: PathwayContent;
}

export interface Pathway {
  id: string;
  index?: string;
  type?: string;
  data: PathwayData;
}
