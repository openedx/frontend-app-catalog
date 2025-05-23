import { getConfig } from '@edx/frontend-platform';

/**
 * Gets the base URL for the LMS from the frontend platform configuration.
 */
export const getBaseUrl = () => getConfig().LMS_BASE_URL;

/**
 * Resolves a URL by combining it with a base URL if it's relative.
 * If the URL is null or absolute (starts with http:// or https://), it is returned as is.
 */
export const resolveUrl = (base: string, url: string) => ((url == null || url.startsWith('http://') || url.startsWith('https://')) ? url : `${base}${url}`);

/**
 * Creates a full URL by combining the LMS base URL with a relative path.
 */
export const baseAppUrl = (url: string) => resolveUrl(getBaseUrl(), url);

/**
 * Gets the URL for the programs dashboard page.
 */
export const programsUrl = () => baseAppUrl('/dashboard/programs');

/**
 * Gets a cookie by name.
 */
export const getCookie = (name: string): string | null => {
  let cookieValue: string | null = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const languagePreference = getCookie(getConfig().LANGUAGE_PREFERENCE_COOKIE_NAME);
  return date.toLocaleDateString(languagePreference || 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
