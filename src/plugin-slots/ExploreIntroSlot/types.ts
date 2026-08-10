export interface ExploreIntroSlotProps {
  searchString: string;
  resultsCount?: number;
}

/**
 * Props passed to plugins rendered in this slot via `pluginProps`.
 */
export interface ExploreIntroSlotPluginProps {
  searchString: string;
  resultsCount?: number;
  /**
   * @deprecated Use `resultsCount` instead.
   */
  courseDataResultsLength?: number;
}
