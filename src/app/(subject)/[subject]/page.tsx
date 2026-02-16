interface SubjectPageProps {
  params: Promise<{
    subject: string;
  }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject: subjectSlug } = await params;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-10 lg:px-14">
      <div className="rounded-xl border bg-card p-6">
        <h1 className="font-semibold text-2xl tracking-tight">
          {subjectSlug} overview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick a lesson from the sidebar to continue.
        </p>
      </div>
    </div>
  );
}
