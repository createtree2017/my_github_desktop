import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { CampaignProvider } from './CampaignContext';
import { ApplicationProvider } from './ApplicationContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <CampaignProvider>
        <ApplicationProvider>
          {children}
        </ApplicationProvider>
      </CampaignProvider>
    </AuthProvider>
  );
}; 