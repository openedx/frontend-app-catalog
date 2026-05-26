import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const LoaderSlot = ({ children }: { children: React.ReactNode }) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.generic.loader"
    slotOptions={{
      mergeProps: true,
    }}
  >
    {children}
  </PluginSlot>
);
