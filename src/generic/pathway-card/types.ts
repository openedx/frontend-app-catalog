export interface PathwayContent {
  displayName: string;
}

export interface PathwayData {
  org: string;
  itemCount: number;
  imageUrl?: string;
  start?: string;
  advertisedStart?: string;
  category: string;
  categoryLabel: string;
  categoryBackgroundColor: string;
  categoryTextColor: string;
  content: PathwayContent;
}

export interface Pathway {
  id: string;
  index?: string;
  type: 'pathway';
  data: PathwayData;
}
