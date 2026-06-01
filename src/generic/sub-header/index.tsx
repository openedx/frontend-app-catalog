import classNames from 'classnames';

import type { SubHeaderProps } from './types';

export const SubHeader = ({ title, className }: SubHeaderProps) => (
  <header className={classNames('mb-5 d-flex justify-content-between', className)}>
    <h1 className="mb-0">{title}</h1>
  </header>
);
