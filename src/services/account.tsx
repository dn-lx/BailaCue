import { Platform } from "react-native";
import React, { createContext, useContext, useEffect, useState } from "react";
import { vault } from "./cloud/vault";
const endpoint =
  process.env.EXPO_PUBLIC_BAILACUE_API_URL ??
  (Platform.OS === "web"
    ? ""
    : "https://wbqnctrvxohxwiaignhg.supabase.co/functions/v1/bailacue-api");
type Session = {
  token: string;
  expiresAt: string;
  user: { id: string; username: string };
};
export class SyncConflict extends Error {}
export class AccountError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function accountRequest(
  action: string,
  fields: Record<string, unknown>,
  token?: string,
) {
  if (!endpoint)
    throw new Error(
      "Account access is not enabled in this browser preview. Use the mobile app to sign in and sync your library.",
    );
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, ...fields }),
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 409 && action === "save")
      throw new SyncConflict(result.error);
    throw new AccountError(
      result.error ?? "Account request failed.",
      response.status,
    );
  }
  return result;
}
type Account = {
  session: Session | null;
  ready: boolean;
  configured: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<string>;
  recover: (email: string) => Promise<string>;
  request: (action: string, fields?: Record<string, unknown>) => Promise<any>;
  logout: () => Promise<void>;
};
const Context = createContext<Account | null>(null);
export function AccountProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    vault
      .get("app-session")
      .then((raw) => {
        if (raw) {
          const value = JSON.parse(raw) as Session;
          if (new Date(value.expiresAt).getTime() > Date.now())
            setSession(value);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  async function login(username: string, password: string) {
    const result = (await accountRequest("login", {
      username,
      password,
    })) as Session;
    await vault.set("app-session", JSON.stringify(result));
    setSession(result);
  }
  async function logout() {
    try {
      if (session) await accountRequest("logout", {}, session.token);
    } finally {
      await vault.remove("app-session");
      setSession(null);
    }
  }
  return (
    <Context.Provider
      value={{
        session,
        ready,
        configured: !!endpoint,
        login,
        logout,
        register: async (username, email, password) =>
          (await accountRequest("register", { username, email, password }))
            .message,
        recover: async (email) =>
          (await accountRequest("recover", { email })).message,
        request: (action, fields = {}) =>
          accountRequest(action, fields, session?.token),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAccount() {
  const account = useContext(Context);
  if (!account) throw new Error("Account provider is missing.");
  return account;
}

export async function verifyCollectionGrant(id: string) {
  const raw = await vault.get("app-session");
  if (!raw)
    throw new Error("Sign in to check access to this shared collection.");
  const session = JSON.parse(raw) as Session;
  return accountRequest("share-open", { id }, session.token);
}
