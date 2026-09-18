import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminModerationQueue } from "@/features/admin/AdminModerationQueue";
import { LinkButton } from "@/components/ui/Button";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { readSessionUser } from "@/server/auth/session";
import { listSubmissions } from "@/server/submissions/store";

export const metadata: Metadata = buildPageMetadata({
  title: "Адмін",
  description: "Модерація dodai.app",
  path: "/admin",
  noIndex: true,
});

export default async function AdminPage() {
  const user = await readSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/account");

  const queue = (await listSubmissions()).filter(
    (item) => item.status === "moderation" || item.status === "paid",
  );

  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
            /admin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Модерація</h1>
          <p className="mt-2 text-ink/70">
            Публікація лише після GEO-перевірки (tagline, платформи, UA-звʼязок).
          </p>
        </div>
        <LinkButton href="/account" variant="secondary" size="sm">
          Кабінет
        </LinkButton>
      </div>

      <AdminModerationQueue items={queue} />
    </div>
  );
}
