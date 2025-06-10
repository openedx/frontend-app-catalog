import Header from '@edx/frontend-component-header';
import { getConfig } from '@edx/frontend-platform';

import { useMenuItems } from './hooks/useMenuItems';

const CatalogHeader = () => {
  const { mainMenu, secondaryMenu, isNotHomePage } = useMenuItems();

  return (
    <Header
      mainMenuItems={mainMenu}
      logoDestination={!isNotHomePage && getConfig().LMS_BASE_URL}
      secondaryMenuItems={secondaryMenu}
    />
  );
};

export default CatalogHeader;
