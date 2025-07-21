
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

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
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}
