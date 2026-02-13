import { redirect } from "next/navigation";
import { getCanonicalLessonRoute } from "@/features/mdx/load-lesson-mock";

export default function HomePage() {
  redirect(getCanonicalLessonRoute().url);
}
