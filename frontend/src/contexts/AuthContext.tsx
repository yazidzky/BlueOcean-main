import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import api from "@/lib/api";
import { initializeSocket, disconnectSocket } from "@/lib/socket";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
  bio?: string;
  interests?: string[];
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setUserData: (u: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("blueocean-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("blueocean-token");
    if (token && user) {
      initializeSocket(token);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, ...userData } = response.data;

      const user: User = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        status: userData.status,
      };

      setUser(user);
      localStorage.setItem("blueocean-user", JSON.stringify(user));
      localStorage.setItem("blueocean-token", token);

      initializeSocket(token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const { token, ...userData } = response.data;

      const user: User = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        status: userData.status,
      };

      setUser(user);
      localStorage.setItem("blueocean-user", JSON.stringify(user));
      localStorage.setItem("blueocean-token", token);

      initializeSocket(token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("blueocean-user");
      localStorage.removeItem("blueocean-token");
      disconnectSocket();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        setUserData: (u: User) => {
          setUser(u);
          localStorage.setItem("blueocean-user", JSON.stringify(u));
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
