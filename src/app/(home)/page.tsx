"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";

export default function HomePage() {
  // Temporary: keep subject list query here until home page work starts,
  // then extract this into a dedicated subject-list component.
  const subjects = useQuery(api.subjects.list, {});

  if (subjects === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-10 lg:px-14">
        <div className="rounded-xl border bg-card p-6">
          <h1 className="font-semibold text-2xl tracking-tight">Loading...</h1>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-10 lg:px-14">
        <div className="rounded-xl border bg-card p-6">
          <h1 className="font-semibold text-2xl tracking-tight">
            No subjects yet
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add your first subject in Convex to start building your digital
            garden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-14">
      <h1 className="font-semibold text-3xl tracking-tight">Subjects</h1>
      <p className="mt-2 text-muted-foreground">
        Choose a subject to open its lesson tree.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Link
            className="rounded-xl border bg-card p-5 transition-colors hover:border-foreground/35"
            href={`/${subject.slug}`}
            key={subject.uid}
          >
            <h2 className="font-medium text-lg">{subject.name}</h2>
            {subject.description ? (
              <p className="mt-2 text-muted-foreground text-sm">
                {subject.description}
              </p>
            ) : (
              <p className="mt-2 text-muted-foreground text-sm">
                No description yet.
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
