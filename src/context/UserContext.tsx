// context/UserContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface UserContextType {
  user: User | null;
  loading: boolean;
  userSubscribed: boolean;
  signOut: () => Promise<void>;
  totalUsersCount: number;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  userSubscribed: false,
  signOut: async () => {},
  totalUsersCount: 0
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const userSubscribed = false;

// Update the fetchTotalUsersCount function to work for all users
const fetchTotalUsersCount = async () => {
  try {

    const { data, error } = await supabase.rpc('get_user_count');
    console.log("Fetched count:", data.total_users);

    if (error) {
      console.error('Error fetching user count from profiles:', error);
 
      return;
    }

    setTotalUsersCount(data.total_users || 0);
  } catch (error) {
    console.error('Error fetching user count:', error);
    
    setTotalUsersCount(prev => prev > 0 ? prev : 1000); // Example fallback
  }
};

useEffect(() => {
  const initialize = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
    setLoading(false);
    
    // Always fetch user count, even for unauthenticated users
    fetchTotalUsersCount();
  };

  initialize();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    setUser(session?.user ?? null);
    setLoading(false);
    await fetchTotalUsersCount();
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);


const signOut = async () => {
  try {
    console.log('Attempting to sign out...');

    // const { error } = await supabase.auth.signOut();

    localStorage.removeItem('sb-iypmyaextacoondkwxge-auth-token');
    console.log('Sign out successful');
    
    // Force state update and reload
    setUser(null);
    setTimeout(() => window.location.reload(), 10);
    
  } catch (error) {
    console.error('Error during sign out:', error);
    // Force cleanup on error
    localStorage.clear();
    setUser(null);
    window.location.reload();
  }
};

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      signOut, 
      userSubscribed, 
      totalUsersCount 
    }}>
      {children}
    </UserContext.Provider>
  );
};