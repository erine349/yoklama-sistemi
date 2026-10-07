import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { initialProfiles } from '../lib/seedData';
import { getSupabaseClient } from '../lib/supabase';

interface AuthContextType {
  currentUser: Profile;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  availableProfiles: Profile[];
  registerProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem('akademipro_profiles');
      if (saved) {
        const parsed: Profile[] = JSON.parse(saved);
        const merged = [...parsed];
        initialProfiles.forEach((ip) => {
          if (!merged.some((p) => p.id === ip.id || p.email.toLowerCase() === ip.email.toLowerCase())) {
            merged.push(ip);
          }
        });
        return merged;
      }
      return initialProfiles;
    } catch {
      return initialProfiles;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const isLogged = localStorage.getItem('akademipro_is_logged_in');
      return isLogged === 'false' ? false : true;
    } catch {
      return true;
    }
  });

  const [currentUser, setCurrentUser] = useState<Profile>(() => {
    try {
      const savedRole = localStorage.getItem('akademipro_active_role');
      if (savedRole) {
        const found = initialProfiles.find((p) => p.role === savedRole);
        if (found) return found;
      }
      return initialProfiles[0];
    } catch {
      return initialProfiles[0];
    }
  });

  useEffect(() => {
    localStorage.setItem('akademipro_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('akademipro_active_role', currentUser.role);
    localStorage.setItem('akademipro_is_logged_in', isAuthenticated ? 'true' : 'false');
  }, [currentUser, isAuthenticated]);

  const registerProfile = (profile: Profile) => {
    setProfiles((prev) => {
      if (prev.some((p) => p.email.toLowerCase() === profile.email.toLowerCase() || p.id === profile.id)) {
        return prev;
      }
      return [...prev, profile];
    });
  };

  const switchRole = (role: UserRole) => {
    const match = profiles.find((p) => p.role === role);
    if (match) {
      setCurrentUser(match);
      setIsAuthenticated(true);
    }
  };

  const loginWithEmail = async (email: string, password?: string): Promise<boolean> => {
    // If Supabase is connected, attempt Supabase Auth sign-in
    const supabase = getSupabaseClient();
    if (supabase && password) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          console.warn('Supabase auth attempt:', error.message);
        }
      } catch (err) {
        console.warn('Supabase auth catch:', err);
      }
    }

    const clean = email.trim().toLowerCase();
    const found = profiles.find(
      (p) =>
        p.email.toLowerCase() === clean ||
        p.email.toLowerCase().includes(clean) ||
        clean.includes(p.role)
    );

    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      return true;
    }

    // If generic domain or username matched
    if (
      clean.includes('bolge') ||
      clean.includes('kemal') ||
      clean.includes('sorumlu') ||
      clean.includes('koordinator')
    ) {
      const match =
        profiles.find((p) => p.role === 'bolge_sorumlusu') ||
        initialProfiles.find((p) => p.role === 'bolge_sorumlusu') ||
        profiles[0];
      setCurrentUser(match);
      setIsAuthenticated(true);
      return true;
    } else if (clean.includes('mudur') || clean.includes('selim') || clean.includes('gulsen')) {
      setCurrentUser(profiles.find((p) => p.role === 'mudur') || profiles[1]);
      setIsAuthenticated(true);
      return true;
    } else if (clean.includes('ogretmen') || clean.includes('ayse')) {
      setCurrentUser(profiles.find((p) => p.role === 'ogretmen') || profiles[2]);
      setIsAuthenticated(true);
      return true;
    } else if (clean.includes('veli') || clean.includes('mustafa')) {
      setCurrentUser(profiles.find((p) => p.role === 'veli') || profiles[4]);
      setIsAuthenticated(true);
      return true;
    } else if (clean.includes('ogrenci') || clean.includes('kerem')) {
      setCurrentUser(profiles.find((p) => p.role === 'ogrenci') || profiles[5]);
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  const logout = () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(console.error);
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        switchRole,
        loginWithEmail,
        logout,
        availableProfiles: profiles,
        registerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
