import type { Metadata } from "next";
import { QuizSetup } from "@/components/quiz-setup";
import { PageHeader } from "@/components/ui/page-header";
import { getCopy } from "@/lib/copy";
import { requireUser } from "@/lib/session";
import { getLevelCounts } from "@/services/word.service";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const copy = getCopy(user.locale);
  const params = await searchParams;
  const difficult = params.pool === "difficult";
  const counts = await getLevelCounts(user.id, difficult);

  return (
    <div>
      <PageHeader title={copy.quiz.title} description={copy.quiz.description} />
      <QuizSetup copy={copy} counts={counts} difficult={difficult} />
    </div>
  );
}
