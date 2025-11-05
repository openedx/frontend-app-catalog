import { logInfo } from '@edx/frontend-platform/logging';

/**
 * Processes overview content to replace image paths
 * @param overview - The overview HTML content
 * @returns Processed overview content with updated image paths
 */
export const processOverviewContent = (overview: string, lmsBaseUrl: string): string => {
  if (!overview) { return overview; }

  return overview.replace(
    /src="\/static\/images\//g,
    `src="${lmsBaseUrl}/static/images/`,
  );
};

/**
 * Checks if HTML content has real visible content by parsing it through DOM
 * @param html - The HTML content to check
 * @returns True if the HTML contains real visible content
 */
export const hasVisibleContent = (html: string): boolean => {
  if (!html) { return false; }

  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const technicalElements = tempDiv.querySelectorAll('script, style, meta, link');
    technicalElements.forEach(el => el.remove());

    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    const cleanText = textContent.trim();

    return cleanText.length > 0;
  } catch (error) {
    logInfo('Error parsing HTML content:', error);
    return false;
  }
};
