import type { FC } from 'react';
import { DataTable } from '@openedx/paragon';

import type { CourseCatalogDataTableControlBarSlotProps } from './types';

const CourseCatalogDataTableControlBarSlot: FC<CourseCatalogDataTableControlBarSlotProps> = () => (
  <>
    <DataTable.TableControlBar />
  </>
);

export default CourseCatalogDataTableControlBarSlot;
