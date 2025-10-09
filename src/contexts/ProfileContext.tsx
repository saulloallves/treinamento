import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ProfileType = 'Admin' | 'Professor' | 'Aluno' | null;

interface ProfileContextType {
  selectedProfile: ProfileType;
  setSelectedProfile: (profile: ProfileType) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProfile, setSelectedProfileState] = useState<ProfileType>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected_profile') as ProfileType;
    }
    return null;
  });

  const setSelectedProfile = (profile: ProfileType) => {
    console.log('🎯 ProfileContext - Setting selected profile:', profile);
    setSelectedProfileState(profile);
    
    if (profile) {
      localStorage.setItem('selected_profile', profile);
    } else {
      localStorage.removeItem('selected_profile');
    }
  };

  const clearProfile = () => {
    console.log('🎯 ProfileContext - Clearing profile');
    setSelectedProfileState(null);
    localStorage.removeItem('selected_profile');
  };

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selected_profile') {
        const newProfile = e.newValue as ProfileType;
        console.log('🎯 ProfileContext - Storage changed, updating profile:', newProfile);
        setSelectedProfileState(newProfile);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ProfileContext.Provider value={{ selectedProfile, setSelectedProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};