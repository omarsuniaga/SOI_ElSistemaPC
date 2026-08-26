import React, { createContext, useContext } from 'react';
import { AppContainer, container } from '../../container';

const ContainerContext = createContext<AppContainer>(container);

export const AppContainerProvider: React.FC<{ children: React.ReactNode; customContainer?: AppContainer }> = ({
  children,
  customContainer,
}) => {
  return (
    <ContainerContext.Provider value={customContainer || container}>
      {children}
    </ContainerContext.Provider>
  );
};

export function useAppContainer(): AppContainer {
  const ctx = useContext(ContainerContext);
  if (!ctx) {
    throw new Error('useAppContainer must be used within an AppContainerProvider');
  }
  return ctx;
}
