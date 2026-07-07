import { Slot } from '@openedx/frontend-base';

export const LoaderSlot = ({ children }: { children: React.ReactNode }) => (
  <Slot id="org.openedx.frontend.slot.catalog.loader.v1">
    {children}
  </Slot>
);
