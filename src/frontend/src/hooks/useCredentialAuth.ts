import { useCallback, useMemo } from "react";

export interface CredentialAccount {
  username: string;
  passwordHash: string; // SHA-256 hex
  role: "admin" | "teacher" | "checker";
  name: string;
  email: string;
  phone: string;
  qualifications: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CredentialSession {
  username: string;
  role: "admin" | "teacher" | "checker";
  name: string;
  email: string;
  phone: string;
  qualifications: string;
}

const CREDS_KEY = "ftms_credentials";
const SESSION_KEY = "ftms_session";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadAccounts(): CredentialAccount[] {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) return JSON.parse(raw) as CredentialAccount[];
  } catch {
    // ignore parse errors
  }
  return [];
}

function saveAccounts(accounts: CredentialAccount[]): void {
  localStorage.setItem(CREDS_KEY, JSON.stringify(accounts));
}

// Seed default admin on first run
function seedDefaultAdmin() {
  const existing = loadAccounts();
  if (existing.length === 0) {
    sha256("admin123").then((hash) => {
      const current = loadAccounts();
      if (current.length === 0) {
        saveAccounts([
          {
            username: "admin",
            passwordHash: hash,
            role: "admin",
            name: "Administrator",
            email: "admin@ftms.edu",
            phone: "9999999999",
            qualifications: "System Administrator",
            isApproved: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    });
  }
}

// Seed default checker account if none exists
function seedDefaultChecker() {
  sha256("checker123").then((hash) => {
    const accounts = loadAccounts();
    const hasChecker = accounts.some((a) => a.role === "checker");
    if (!hasChecker) {
      saveAccounts([
        ...accounts,
        {
          username: "checker",
          passwordHash: hash,
          role: "checker",
          name: "Checker",
          email: "checker@ftms.edu",
          phone: "8888888888",
          qualifications: "Bill Checker",
          isApproved: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  });
}

seedDefaultAdmin();
seedDefaultChecker();

export function useCredentialAuth() {
  const login = useCallback(
    async (username: string, password: string): Promise<CredentialSession> => {
      const hash = await sha256(password);
      const accounts = loadAccounts();
      const account = accounts.find(
        (a) =>
          a.username.toLowerCase() === username.toLowerCase() &&
          a.passwordHash === hash,
      );
      if (!account) {
        throw new Error("Invalid username or password");
      }
      if (!account.isApproved) {
        throw new Error("Account not yet approved");
      }
      const session: CredentialSession = {
        username: account.username,
        role: account.role,
        name: account.name,
        email: account.email,
        phone: account.phone,
        qualifications: account.qualifications,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const getSession = useCallback((): CredentialSession | null => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as CredentialSession) : null;
    } catch {
      return null;
    }
  }, []);

  const listAccounts = useCallback((): CredentialAccount[] => {
    return loadAccounts();
  }, []);

  const createAccount = useCallback(
    async (
      account: Omit<CredentialAccount, "passwordHash"> & { password: string },
    ): Promise<void> => {
      const hash = await sha256(account.password);
      const accounts = loadAccounts();
      if (
        accounts.find(
          (a) => a.username.toLowerCase() === account.username.toLowerCase(),
        )
      ) {
        throw new Error("Username already exists");
      }
      const newAccount: CredentialAccount = {
        username: account.username,
        passwordHash: hash,
        role: account.role,
        name: account.name,
        email: account.email,
        phone: account.phone,
        qualifications: account.qualifications,
        isApproved: account.isApproved,
        createdAt: account.createdAt,
      };
      saveAccounts([...accounts, newAccount]);
    },
    [],
  );

  const deleteAccount = useCallback((username: string): void => {
    const accounts = loadAccounts();
    saveAccounts(accounts.filter((a) => a.username !== username));
  }, []);

  const changePassword = useCallback(
    async (
      username: string,
      oldPassword: string,
      newPassword: string,
    ): Promise<void> => {
      const oldHash = await sha256(oldPassword);
      const accounts = loadAccounts();
      const idx = accounts.findIndex(
        (a) => a.username === username && a.passwordHash === oldHash,
      );
      if (idx === -1) {
        throw new Error("Current password is incorrect");
      }
      const newHash = await sha256(newPassword);
      const updated = [...accounts];
      updated[idx] = { ...updated[idx], passwordHash: newHash };
      saveAccounts(updated);
    },
    [],
  );

  return useMemo(
    () => ({
      login,
      logout,
      getSession,
      listAccounts,
      createAccount,
      deleteAccount,
      changePassword,
    }),
    [
      login,
      logout,
      getSession,
      listAccounts,
      createAccount,
      deleteAccount,
      changePassword,
    ],
  );
}

export default useCredentialAuth;
