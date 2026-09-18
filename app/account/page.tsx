import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { readSessionUser } from "@/server/auth/session";
import { listSubmissions } from "@/server/submissions/store";

export const metadata: Metadata = buildPageMetadata({
  title: "Кабінет",
  description: "Ваші заявки на dodai.app",
  path: "/account",
  noIndex: true,
});

export default async function AccountPage() {
  const user = await readSessionUser();
  if (!user) redirect("/login");

  const submissions = (await listSubmissions()).filter(
    (item) => item.ownerEmail.toLowerCase() === user.email.toLowerCase(),
  );

  return (
    <div className="mx-auto max-w-[880px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
            /account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Кабінет</h1>
          <p className="mt-2 text-ink/70">{user.email}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="text-sm underline" type="submit">
            Вийти
          </button>
        </form>
      </div>

      {user.role === "admin" ? (
        <div className="mb-8">
          <LinkButton href="/admin">Адмін / модерація</LinkButton>
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Ваші заявки</h2>
        {submissions.length === 0 ? (
          <p className="text-ink/65">
            Поки немає заявок.{" "}
            <LinkButton href="/submit" variant="secondary" size="sm">
              Додати продукт
            </LinkButton>
          </p>
        ) : (
          <ul className="space-y-3">
            {submissions.map((item) => (
              <li
                key={item.id}
                className="rounded-card border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="font-mono-meta text-[10px] uppercase text-ink/45">
                      {item.status} · {item.domain}
                    </p>
                  </div>
                  {item.status === "pending_payment" ? (
                    <LinkButton href={`/submit/pay/${item.id}`} size="sm">
                      До модерації
                    </LinkButton>
                  ) : null}
                  {item.publishedSlug ? (
                    <LinkButton
                      href={`/products/${item.publishedSlug}`}
                      variant="secondary"
                      size="sm"
                    >
                      Відкрити картку
                    </LinkButton>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
