import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';

import { ROUTES } from '../../routes';
import { programsUrl } from '../../utils';
import { AppContextTypes, MenuItem } from '../types';

import messages from '../messages';

export const useMenuItems = () => {
  const intl = useIntl();
  const location = useLocation();
  const { authenticatedUser } = useContext(AppContext) as AppContextTypes;

  const isCourseCatalogPage = location.pathname === ROUTES.COURSES;
  const isCourseAboutPage = location.pathname.includes(ROUTES.COURSE_ABOUT);
  const isNotHomePage = isCourseCatalogPage || isCourseAboutPage;

  const getNotAuthenticatedUserMainMenu = (): MenuItem[] => [
    ...(getConfig().ENABLE_COURSE_DISCOVERY ? [{
      type: 'item' as const,
      href: `${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`,
      content: intl.formatMessage(messages.exploreCourses),
      isActive: isCourseCatalogPage,
    }] : []),
  ];

  const getAuthenticatedUserMainMenu = (): MenuItem[] => [
    {
      type: 'item' as const,
      href: `${getConfig().LMS_BASE_URL}/dashboard`,
      content: intl.formatMessage(messages.courses),
    },
    ...(getConfig().ENABLE_PROGRAMS ? [{
      type: 'item' as const,
      href: `${programsUrl()}`,
      content: intl.formatMessage(messages.programs),
    }] : []),
    ...(getConfig().COURSES_ARE_BROWSABLE ? [{
      type: 'item' as const,
      href: `${getConfig().LMS_BASE_URL}${ROUTES.COURSES}`,
      content: intl.formatMessage(messages.discoverNew),
      isActive: isCourseCatalogPage,
    }] : []),
  ];

  const getSecondaryMenu = (): MenuItem[] => [
    ...(getConfig().SUPPORT_URL ? [{
      type: 'item' as const,
      href: `${getConfig().SUPPORT_URL}`,
      content: intl.formatMessage(messages.help),
    }] : []),
  ];

  return {
    mainMenu: authenticatedUser ? getAuthenticatedUserMainMenu() : getNotAuthenticatedUserMainMenu(),
    secondaryMenu: getSecondaryMenu(),
    isNotHomePage,
  };
};
