import type { Metadata } from "next";
import { ProductCard } from "@/components/domain/ProductCard";
import { getProductOfTheDay } from "@/lib/catalog/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { readVoterKeyFromCookie } from "@/lib/votes/anonymous";
import { awardWeekStartKyiv } from "@/lib/votes/rules";
import { readSessionUser } from "@/server/auth/session";
import { getLaunchVoteState, listAwards } from "@/server/votes/service";

export const metadata: Metadata = buildPageMetadata({
  title: "Продукт тижня",
  description:
    "Щотижневий український цифровий продукт на dodai.app. Статус не продається — спочатку редакція, пізніше голосування.",
  path: "/product-of-the-week",
});

export default async function ProductOfTheWeekPage() {
  const [product, user, awards, anonKey] = await Promise.all([
    getProductOfTheDay(),
    readSessionUser(),
    listAwards(),
    readVoterKeyFromCookie(),
  ]);

  const weekAward = awards.find(
    (award) =>
      award.awardType === "product_of_the_day" &&
      award.awardDate === awardWeekStartKyiv(),
  );

  let vote:
    | {
        launchId: string;
        voteCount: number;
        hasVoted: boolean;
      }
    | undefined;

  if (product?.activeLaunchId) {
    try {
      const state = await getLaunchVoteState(
        product.activeLaunchId,
        user?.email ?? anonKey,
      );
      vote = {
        launchId: state.launch.id,
        voteCount: state.voteCount,
        hasVoted: state.hasVoted,
      };
    } catch {
      vote = undefined;
    }
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
        /product-of-the-week
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Продукт тижня</h1>
      <p className="mt-4 text-ink/70">
        Не купується. Зараз — редакційний вибір на тиждень
        {weekAward ? ` (${weekAward.source})` : ""}. Перехід на переможця
        голосування — окреме продуктове рішення. Голос — без реєстрації.
      </p>
      {product ? (
        <div className="mt-8">
          <ProductCard product={product} vote={vote} />
        </div>
      ) : (
        <p className="mt-8 rounded-card border border-line bg-surface p-4 text-sm text-ink/70">
          Цього тижня ще немає призначеного продукту тижня.
        </p>
      )}
    </div>
  );
}
