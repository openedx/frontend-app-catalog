import type { CatalogListSearchMixedResponse, DataTableParams } from '@src/data/course-list-search/types';

export interface TableColumnFilterChoice {
  name: string;
  number: number;
  value: string;
}

export interface TableColumn {
  Header: string;
  accessor: string;
  Filter: React.ComponentType<any>;
  filter: string;
  filterChoices: TableColumnFilterChoice[];
}

export interface CourseCatalogDataTableSlotProps {
  displayData?: CatalogListSearchMixedResponse;
  totalCourses: number;
  pageCount: number;
  pageIndex: number;
  tableColumns: TableColumn[];
  handleFetchData: (params: DataTableParams) => void;
}
