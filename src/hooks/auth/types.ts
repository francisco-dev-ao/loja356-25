
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  nif: string | null;
  address: string | null;
  role: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}
