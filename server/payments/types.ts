export type PaymentPurpose = "base_listing" | "passport_listing" | "placement";

export type CreatePaymentInput = {
  amountUah: number;
  purpose: PaymentPurpose;
  referenceId: string;
  description: string;
  customerEmail: string;
  idempotencyKey: string;
  redirectUrl: string;
  webhookUrl: string;
};

export type CreatePaymentResult = {
  provider: string;
  providerPaymentId: string;
  checkoutUrl: string;
  status: "created" | "pending";
};

export type WebhookResult = {
  providerPaymentId: string;
  idempotencyKey?: string;
  referenceId: string;
  status: "paid" | "failed" | "expired";
  amountUah: number;
  raw?: unknown;
};

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyAndParseWebhook(
    request: Request,
    body: unknown,
  ): Promise<WebhookResult>;
  refund?(providerPaymentId: string, amountUah?: number): Promise<void>;
}

export { BASE_LISTING_PRICE_UAH } from "@/lib/pricing/catalog";
