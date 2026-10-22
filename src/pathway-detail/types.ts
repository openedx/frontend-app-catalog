/** What a fact describes. Chosen by this field, never by the fact's label or its position. */
export type PathwayFactKind =
  | 'start'
  | 'courses'
  | 'price'
  | 'duration'
  | 'pace'
  | 'certificates'
  | 'badges';

export interface PathwayFact {
  kind: PathwayFactKind;
  label: string;
  value: string;
}

/** What a learner earns from a course. Chosen by this field, never by the credential's copy. */
export type PathwayCredentialKind = 'badge' | 'certificate';

export interface PathwayCourse {
  id: string;
  title: string;
  duration: string;
  pace: string;
  credential: {
    kind: PathwayCredentialKind;
    count: number;
  };
  /** One-line summary shown when the course row is expanded. */
  shortDescription: string;
}

export interface PathwayCredential {
  id: string;
  kind: PathwayCredentialKind;
  /** Earning-rule copy stated in the credential's own words, e.g. "for 50% or more". */
  rule: string;
  courseTitle: string;
}

export interface PathwayDetailData {
  id: string;
  name: string;
  organization: string;
  description: string;
  about: string[];
  imageUrl?: string;
  /** Copy for the pathway-level certificate, e.g. "Bootcamp Certificate". */
  certificateLabel?: string;
  /** ISO start date behind the sticky CTA's "Starts {date}" label. */
  start?: string;
  isEnrolled: boolean;
  facts: PathwayFact[];
  courses: PathwayCourse[];
  credentials: PathwayCredential[];
}
