import { getConfig } from '@edx/frontend-platform';

export const getApiBaseUrl = () => getConfig().LMS_BASE_URL;
export const getHomeSettingsUrl = () => `${getApiBaseUrl()}/api/branding/v1/index`;
