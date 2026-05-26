import Header from '@edx/frontend-component-header';

import { useMenuItems } from './hooks/useMenuItems';

const CatalogHeader = () => {
  const { mainMenu, secondaryMenu } = useMenuItems();

  return (
    <Header
      mainMenuItems={mainMenu}
      secondaryMenuItems={secondaryMenu}
    />
  );
};

export default CatalogHeader;
