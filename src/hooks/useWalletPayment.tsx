// hooks/useWalletPayment.ts
// Handles all three pay-with-wallet flows from the API doc:
//   - Full wallet payment  → payFull(serviceRequestId)
//   - Partial payment      → payPartial(serviceRequestId, walletAmount)
//   - Balance check helper → canPayWithWallet(price)

import { useState, useCallback } from "react";
// import api from "../services/api"; // ← your existing axios/fetch instance
import { useWallet } from "../store/WalletContext";
import api from "../utils/api";
import { Alert } from "react-native";


// ─── Types ────────────────────────────────────────────────────────────────────

export interface PayFullResult {
  success: boolean;
  message: string;
  amountPaid: number;
  currentBalance: number;
}

export interface PayPartialResult {
  success: boolean;
  message: string;
  walletPaid: number;
  remainingToPay: number;
  currentBalance: number;
}

type PaymentError =
  | "INSUFFICIENT_BALANCE"
  | "WALLET_FROZEN"
  | "ALREADY_PAID"
  | "DAILY_LIMIT"
  | "UNKNOWN";

export interface WalletPaymentError {
  code: PaymentError;
  message: string; // user-friendly message
}

interface UseWalletPaymentReturn {
  paying: boolean;
  paymentError: WalletPaymentError | null;
  clearError: () => void;
  canPayWithWallet: (price: number) => boolean;
  payFull: (serviceRequestId: string) => Promise<PayFullResult | null>;
  payPartial: (
    serviceRequestId: string,
    walletAmount: number
  ) => Promise<PayPartialResult | null>;
}

// ─── Error mapper ─────────────────────────────────────────────────────────────

function mapApiError(apiMessage: string): WalletPaymentError {
  const msg = apiMessage?.toLowerCase() ?? "";

  if (msg.includes("insufficient"))
    return {
      code: "INSUFFICIENT_BALANCE",
      message: "Add money to your wallet first.",
    };
  if (msg.includes("frozen"))
    return {
      code: "WALLET_FROZEN",
      message: "Your wallet is suspended. Please contact support.",
    };
  if (msg.includes("already paid"))
    return { code: "ALREADY_PAID", message: "This service is already paid." };
  if (msg.includes("daily"))
    return {
      code: "DAILY_LIMIT",
      message: "Daily wallet limit reached. Pay via cash instead.",
    };

  return { code: "UNKNOWN", message: apiMessage ?? "Payment failed. Try again." };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWalletPayment(): UseWalletPaymentReturn {
  const { wallet, refreshWallet } = useWallet();
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<WalletPaymentError | null>(
    null
  );

  const clearError = useCallback(() => setPaymentError(null), []);

  // Quick client-side check before hitting the API
  const canPayWithWallet = useCallback(
    (price: number): boolean => {
      if (!wallet) return false;
      if (wallet.isFrozen) return false;
      return wallet.credits >= price;
    },
    [wallet]
  );

  // ── Option B: Full wallet payment after booking ───────────────────────────
  const payFull = useCallback(
    async (serviceRequestId: string): Promise<PayFullResult | null> => {
      if (!wallet) return null;

      if (wallet.isFrozen) {
        setPaymentError({
          code: "WALLET_FROZEN",
          message: "Your wallet is suspended. Please contact support.",
        });
        return null;
      }

      setPaying(true);
      setPaymentError(null);

      try {
        const res = await api.post("/api/users/wallet/pay-service", {
          serviceRequestId,
        });

        const data: PayFullResult = res.data;

        if (data.success) {
          await refreshWallet(); // update balance in context
          return data;
        }

        return null;
      } catch (err: any) {
        const apiMsg =
          err?.response?.data?.message ?? "Payment failed. Try again.";
        setPaymentError(mapApiError(apiMsg));
        return null;
      } finally {
        setPaying(false);
      }
    },
    [wallet, refreshWallet]
  );

  // ── Option C: Partial wallet + cash ──────────────────────────────────────
  const payPartial = useCallback(
    async (
      serviceRequestId: string,
      walletAmount: number
    ): Promise<PayPartialResult | null> => {
      if (!wallet) return null;

      if (wallet.isFrozen) {
        setPaymentError({
          code: "WALLET_FROZEN",
          message: "Your wallet is suspended. Please contact support.",
        });
        return null;
      }

      if (wallet.credits < walletAmount) {
        setPaymentError({
          code: "INSUFFICIENT_BALANCE",
          message: "Add money to your wallet first.",
        });
        return null;
      }

      setPaying(true);
      setPaymentError(null);

      try {
        const res = await api.post("/api/users/wallet/partial-pay", {
          serviceRequestId,
          walletAmount,
        });
            console.log("partialPay : ", res);
            
        const data: PayPartialResult = res.data;

        if (data.success) {
          await refreshWallet();
          return data;
        }

        return null;
      } catch (err: any) {
        const apiMsg =
          err?.response?.data?.message ?? "Payment failed. Try again.";
        setPaymentError(mapApiError(apiMsg));
        Alert.alert(paymentError?.message || "Payment Failed", apiMsg);
        console.error("Wallet payment error: ", paymentError?.message || "Payment Failed", apiMsg);
        return null;
      } finally {
        setPaying(false);
      }
    },
    [wallet, refreshWallet]
  );

  return {
    paying,
    paymentError,
    clearError,
    canPayWithWallet,
    payFull,
    payPartial,
  };
}