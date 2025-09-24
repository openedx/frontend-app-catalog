import Header from '@edx/frontend-component-header';

import { useMenuItems } from './hooks/useMenuItems';
import { getLogoDestination } from './utils';
import { AuthenticatedUserTypes } from './types';

const CatalogHeader = () => {
  const {
    authenticatedUser,
    mainMenu,
    secondaryMenu,
    isNotHomePage,
  } = useMenuItems();

  return (
    <Header
      mainMenuItems={mainMenu}
      logoDestination={getLogoDestination(isNotHomePage, authenticatedUser as AuthenticatedUserTypes)}
      secondaryMenuItems={secondaryMenu}
    />
  );
};

export default CatalogHeader;
