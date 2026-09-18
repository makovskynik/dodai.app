import { createHmac, randomUUID } from "node:crypto";
import { getAppUrl } from "@/lib/env";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  WebhookResult,
} from "@/server/payments/types";

/** Dev/demo provider: checkout page simulates success and posts webhook. */
export function createLocalPaymentProvider(): PaymentProvider {
  return {
    name: "local",
    async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
      const providerPaymentId = `local_${randomUUID()}`;
      const checkoutUrl = new URL("/pay/local", getAppUrl());
      checkoutUrl.searchParams.set("paymentId", providerPaymentId);
      checkoutUrl.searchParams.set("referenceId", input.referenceId);
      checkoutUrl.searchParams.set("amount", String(input.amountUah));
      checkoutUrl.searchParams.set("idempotencyKey", input.idempotencyKey);
      return {
        provider: "local",
        providerPaymentId,
        checkoutUrl: checkoutUrl.toString(),
        status: "created",
      };
    },
    async verifyAndParseWebhook(
      _request: Request,
      body: unknown,
    ): Promise<WebhookResult> {
      const payload = body as {
        providerPaymentId?: string;
        referenceId?: string;
        amountUah?: number;
        idempotencyKey?: string;
        status?: "paid" | "failed" | "expired";
      };
      if (!payload.providerPaymentId || !payload.referenceId) {
        throw new Error("Invalid local webhook payload");
      }
      return {
        providerPaymentId: payload.providerPaymentId,
        referenceId: payload.referenceId,
        amountUah: payload.amountUah ?? 100,
        idempotencyKey: payload.idempotencyKey,
        status: payload.status ?? "paid",
        raw: body,
      };
    },
  };
}

export function createMonobankProvider(token: string): PaymentProvider {
  return {
    name: "monobank",
    async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
      const response = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token": token,
        },
        body: JSON.stringify({
          amount: Math.round(input.amountUah * 100),
          ccy: 980,
          merchantPaymInfo: {
            reference: input.idempotencyKey,
            destination: input.description,
            comment: input.referenceId,
          },
          redirectUrl: input.redirectUrl,
          webHookUrl: input.webhookUrl,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Monobank create failed: ${text}`);
      }

      const data = (await response.json()) as {
        invoiceId: string;
        pageUrl: string;
      };

      return {
        provider: "monobank",
        providerPaymentId: data.invoiceId,
        checkoutUrl: data.pageUrl,
        status: "created",
      };
    },
    async verifyAndParseWebhook(
      request: Request,
      body: unknown,
    ): Promise<WebhookResult> {
      // Signature verification should use X-Sign when production keys are live.
      void request;
      const payload = body as {
        invoiceId?: string;
        status?: string;
        amount?: number;
        reference?: string;
        merchantPaymInfo?: { reference?: string; comment?: string };
      };
      if (!payload.invoiceId) throw new Error("Monobank webhook missing invoiceId");

      const status =
        payload.status === "success" || payload.status === "paid"
          ? "paid"
          : payload.status === "expired"
            ? "expired"
            : "failed";

      return {
        providerPaymentId: payload.invoiceId,
        referenceId:
          payload.merchantPaymInfo?.comment ??
          payload.merchantPaymInfo?.reference ??
          payload.reference ??
          "",
        idempotencyKey: payload.merchantPaymInfo?.reference,
        amountUah: payload.amount ? payload.amount / 100 : 0,
        status,
        raw: body,
      };
    },
  };
}

function wayforpaySign(secret: string, parts: Array<string | number>): string {
  return createHmac("md5", secret).update(parts.join(";"), "utf8").digest("hex");
}

export function createWayForPayProvider(config: {
  merchantAccount: string;
  merchantSecret: string;
  merchantDomain: string;
}): PaymentProvider {
  return {
    name: "wayforpay",
    async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
      const orderReference = input.idempotencyKey;
      const orderDate = Math.floor(Date.now() / 1000);
      const amount = input.amountUah;
      const currency = "UAH";
      const productName = [input.description];
      const productCount = [1];
      const productPrice = [amount];

      const merchantSignature = wayforpaySign(config.merchantSecret, [
        config.merchantAccount,
        config.merchantDomain,
        orderReference,
        orderDate,
        amount,
        currency,
        ...productName,
        ...productCount,
        ...productPrice,
      ]);

      // Hosted checkout is typically opened via POST form; we expose a local bridge page.
      const checkoutUrl = new URL("/pay/wayforpay", getAppUrl());
      checkoutUrl.searchParams.set("orderReference", orderReference);
      checkoutUrl.searchParams.set("referenceId", input.referenceId);
      checkoutUrl.searchParams.set("amount", String(amount));
      checkoutUrl.searchParams.set("signature", merchantSignature);
      checkoutUrl.searchParams.set("orderDate", String(orderDate));

      return {
        provider: "wayforpay",
        providerPaymentId: orderReference,
        checkoutUrl: checkoutUrl.toString(),
        status: "created",
      };
    },
    async verifyAndParseWebhook(
      _request: Request,
      body: unknown,
    ): Promise<WebhookResult> {
      const payload = body as {
        orderReference?: string;
        transactionStatus?: string;
        amount?: number | string;
        merchantSignature?: string;
      };
      if (!payload.orderReference) {
        throw new Error("WayForPay webhook missing orderReference");
      }

      const status =
        payload.transactionStatus === "Approved"
          ? "paid"
          : payload.transactionStatus === "Expired"
            ? "expired"
            : "failed";

      return {
        providerPaymentId: payload.orderReference,
        referenceId: payload.orderReference,
        idempotencyKey: payload.orderReference,
        amountUah: Number(payload.amount ?? 0),
        status,
        raw: body,
      };
    },
  };
}
