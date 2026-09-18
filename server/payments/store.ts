import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PaymentPurpose } from "@/server/payments/types";

export type PaymentRecord = {
  id: string;
  provider: string;
  providerPaymentId: string;
  idempotencyKey: string;
  referenceId: string;
  purpose: PaymentPurpose;
  amountUah: number;
  customerEmail: string;
  status: "created" | "pending" | "paid" | "failed" | "expired" | "refunded";
  checkoutUrl: string;
  createdAt: string;
  paidAt?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");

async function readPayments(): Promise<PaymentRecord[]> {
  try {
    return JSON.parse(await readFile(PAYMENTS_FILE, "utf8")) as PaymentRecord[];
  } catch {
    return [];
  }
}

async function writePayments(records: PaymentRecord[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(PAYMENTS_FILE, JSON.stringify(records, null, 2), "utf8");
}

export async function findPaymentByIdempotencyKey(
  key: string,
): Promise<PaymentRecord | undefined> {
  const payments = await readPayments();
  return payments.find((payment) => payment.idempotencyKey === key);
}

export async function findPaymentByProviderId(
  providerPaymentId: string,
): Promise<PaymentRecord | undefined> {
  const payments = await readPayments();
  return payments.find(
    (payment) => payment.providerPaymentId === providerPaymentId,
  );
}

export async function savePayment(
  input: Omit<PaymentRecord, "id" | "createdAt"> & { id?: string },
): Promise<PaymentRecord> {
  const payments = await readPayments();
  const existing = payments.find(
    (payment) => payment.idempotencyKey === input.idempotencyKey,
  );
  if (existing) return existing;

  const record: PaymentRecord = {
    id: input.id ?? randomUUID(),
    provider: input.provider,
    providerPaymentId: input.providerPaymentId,
    idempotencyKey: input.idempotencyKey,
    referenceId: input.referenceId,
    purpose: input.purpose,
    amountUah: input.amountUah,
    customerEmail: input.customerEmail,
    status: input.status,
    checkoutUrl: input.checkoutUrl,
    createdAt: new Date().toISOString(),
    paidAt: input.paidAt,
  };
  payments.unshift(record);
  await writePayments(payments.slice(0, 1000));
  return record;
}

export async function markPaymentStatus(
  providerPaymentId: string,
  status: PaymentRecord["status"],
): Promise<PaymentRecord | undefined> {
  const payments = await readPayments();
  const index = payments.findIndex(
    (payment) => payment.providerPaymentId === providerPaymentId,
  );
  if (index < 0) return undefined;

  const current = payments[index];
  if (current.status === "paid" && status === "paid") {
    return current; // idempotent
  }

  payments[index] = {
    ...current,
    status,
    paidAt: status === "paid" ? new Date().toISOString() : current.paidAt,
  };
  await writePayments(payments);
  return payments[index];
}
