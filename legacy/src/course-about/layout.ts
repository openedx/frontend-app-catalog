const fullWidthSingleColumn = [{ span: 12 }, { span: 'auto' }];
const centeredSingleColumnWithMargins = [{ span: 10, offset: 1 }, { span: 'auto' }];
const twoColumns = [{ span: 9 }, { span: 3 }];
export const GRID_LAYOUT = {
  xs: fullWidthSingleColumn,
  sm: centeredSingleColumnWithMargins,
  md: centeredSingleColumnWithMargins,
  lg: centeredSingleColumnWithMargins,
  xl: twoColumns,
};
