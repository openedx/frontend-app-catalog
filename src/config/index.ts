const configuration = {
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  SITE_NAME: process.env.SITE_NAME,
  // SUPPORT_URL: process.env.SUPPORT_URL || null,
  INFO_EMAIL: process.env.INFO_EMAIL || '',
  LOGO_URL: process.env.LOGO_URL,
  ENABLE_PROGRAMS: process.env.ENABLE_PROGRAMS === 'true',
};

const features = {};

export { configuration, features };
