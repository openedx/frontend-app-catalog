import { SubHeaderProps } from './types';

export const SubHeader = ({ title }: SubHeaderProps) => (
  <header className="mb-5 d-flex justify-content-between">
    <h1 className="mb-0">{title}</h1>
  </header>
);
