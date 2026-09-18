import { getEnv } from "@/lib/env";
import {
  createLocalPaymentProvider,
  createMonobankProvider,
  createWayForPayProvider,
} from "@/server/payments/providers";
import type { PaymentProvider } from "@/server/payments/types";

export function getPaymentProvider(): PaymentProvider {
  const env = getEnv();

  if (env.PAYMENT_PROVIDER === "monobank") {
    if (!env.MONOBANK_TOKEN) {
      throw new Error("MONOBANK_TOKEN is required for PAYMENT_PROVIDER=monobank");
    }
    return createMonobankProvider(env.MONOBANK_TOKEN);
  }

  if (env.PAYMENT_PROVIDER === "wayforpay") {
    if (
      !env.WAYFORPAY_MERCHANT_ACCOUNT ||
      !env.WAYFORPAY_MERCHANT_SECRET ||
      !env.WAYFORPAY_MERCHANT_DOMAIN
    ) {
      throw new Error("WayForPay merchant env vars are required");
    }
    return createWayForPayProvider({
      merchantAccount: env.WAYFORPAY_MERCHANT_ACCOUNT,
      merchantSecret: env.WAYFORPAY_MERCHANT_SECRET,
      merchantDomain: env.WAYFORPAY_MERCHANT_DOMAIN,
    });
  }

  return createLocalPaymentProvider();
}
