import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/LoginForm";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Вхід",
  description: "Увійти в dodai.app через magic link.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-[520px] px-4 py-16 sm:px-6">
      <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
        /login
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Вхід</h1>
      <p className="mt-3 mb-8 text-ink/70">
        Адмін за замовчуванням: <code>admin@dodai.app</code> (змініть через
        ADMIN_EMAILS). Поки немає Resend — посилання видно в консолі / preview.
      </p>
      <LoginForm />
    </div>
  );
}
