import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AUTH_KEY = "amky_auth_session";
const CREDS_KEY = "amky_credentials";
const USERNAME_KEY = "amky_username";

const DEFAULT_PASSWORD_HASH =
  "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"; // sha256 of 'password'
const DEFAULT_USERNAME = "admin";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getStoredHash(): string {
  return localStorage.getItem(CREDS_KEY) || DEFAULT_PASSWORD_HASH;
}

function getStoredUsername(): string {
  return localStorage.getItem(USERNAME_KEY) || DEFAULT_USERNAME;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
  changeUsername: (
    currentPassword: string,
    newUsername: string,
  ) => Promise<boolean>;
  resetToDefault: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    const storedUsername = getStoredUsername();
    if (username.toLowerCase() !== storedUsername.toLowerCase()) return false;
    const hash = await sha256(password);
    const stored = getStoredHash();
    if (hash === stored) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    const currentHash = await sha256(currentPassword);
    const stored = getStoredHash();
    if (currentHash !== stored) return false;
    const newHash = await sha256(newPassword);
    localStorage.setItem(CREDS_KEY, newHash);
    return true;
  };

  const changeUsername = async (
    currentPassword: string,
    newUsername: string,
  ): Promise<boolean> => {
    const currentHash = await sha256(currentPassword);
    const stored = getStoredHash();
    if (currentHash !== stored) return false;
    localStorage.setItem(USERNAME_KEY, newUsername.trim());
    return true;
  };

  const resetToDefault = () => {
    localStorage.removeItem(CREDS_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        changePassword,
        changeUsername,
        resetToDefault,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
