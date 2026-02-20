import { CreateLessonEditor } from "@/features/editor/components/create-lesson-editor";

interface StudioEditorPageProps {
  params: Promise<{
    subject: string;
  }>;
}

export default async function StudioEditorPage({
  params,
}: StudioEditorPageProps) {
  await params;

  return <CreateLessonEditor />;
}
