import { SubHeaderProps } from './types';

export const SubHeader = ({ title }: SubHeaderProps) => (
  <header className="sub-header d-flex justify-content-between">
    <h1 className="mb-0">{title}</h1>
  </header>
);
