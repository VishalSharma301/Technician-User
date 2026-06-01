// context/WalletContext.tsx
// Provides wallet balance, frozen status, and a manual refresh.
// Polls every 2 minutes while the app is in the foreground.

import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { BASE } from "../utils/BASE_URL";
import api from "../utils/api";
// ← your existing axios/fetch instance

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletSummary {
  credits: number;
  totalCredited: number;
  totalDebited: number;
  isFrozen: boolean;
  frozenReason: string | null;
  lastTransactionAt: string | null;
}

interface WalletContextValue {
  wallet: WalletSummary | null;
  loading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultWallet: WalletSummary = {
  credits: 0,
  totalCredited: 0,
  totalDebited: 0,
  isFrozen: false,
  frozenReason: null,
  lastTransactionAt: null,
};

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

// ─── Context ──────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextValue>({
  wallet: null,
  loading: false,
  error: null,
  refreshWallet: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const fetchWallet = useCallback(async () => {
    console.log(
      "wallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetchingwallet fetching",
    );
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/users/wallet/summary");
      const data = res.data; // adjust if your axios instance unwraps differently
      if (data.success) {
        setWallet({
          credits: data.credits,
          totalCredited: data.totalCredited,
          totalDebited: data.totalDebited,
          isFrozen: data.isFrozen,
          frozenReason: data.frozenReason,
          lastTransactionAt: data.lastTransactionAt,
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  // Start / stop polling based on app foreground state
  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // already running
    intervalRef.current = setInterval(fetchWallet, POLL_INTERVAL_MS);
  }, [fetchWallet]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchWallet(); // initial load
    startPolling();
    

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          fetchWallet(); // refresh immediately when foregrounded
          startPolling();
        } else if (nextState.match(/inactive|background/)) {
          stopPolling();
        }
        appStateRef.current = nextState;
      },
    );

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [fetchWallet, startPolling, stopPolling]);

  return (
    <WalletContext.Provider
      value={{ wallet, loading, error, refreshWallet: fetchWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallet() {
  return useContext(WalletContext);
}
