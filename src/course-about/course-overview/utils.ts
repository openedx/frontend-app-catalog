/**
 * Processes overview content to replace image paths
 * @param overview - The overview HTML content
 * @returns Processed overview content with updated image paths
 */
export const processOverviewContent = (overview: string, lmsBaseUrl: string): string => {
  if (!overview) {
    return overview;
  }

  return overview.replace(
    /src="\/(static\/images\/|asset)/g,
    (_, path) => `src="${lmsBaseUrl}/${path}`,
  );
};
