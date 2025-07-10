import {
  createContext, useContext, useMemo,
} from 'react';
import { useFrontendParamsQuery } from './hooks';
import { FrontendParamsContextType, FrontendParamsProviderProps } from './types';

const FrontendParamsContext = createContext<FrontendParamsContextType | undefined>(undefined);

export const FrontendParamsProvider = ({ children }: FrontendParamsProviderProps) => {
  const {
    data, isLoading, error, isError,
  } = useFrontendParamsQuery();

  const value = useMemo<FrontendParamsContextType>(() => ({
    data,
    isLoading,
    error: error || null,
    isError,
  }), [data, isLoading, error, isError]);

  return (
    <FrontendParamsContext.Provider value={value}>
      {children}
    </FrontendParamsContext.Provider>
  );
};

export const useFrontendParams = (): FrontendParamsContextType => {
  const context = useContext(FrontendParamsContext);

  if (context === undefined) {
    throw new Error('useFrontendParams must be used within a FrontendParamsProvider');
  }

  return context;
};
