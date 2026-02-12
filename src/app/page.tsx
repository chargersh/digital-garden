import { LessonFrame } from "@/features/content/lesson-frame";

const tocItems = [
  { id: "why-us", label: "Why us?" },
  { id: "get-started-in-5-minutes", label: "Get started in 5 minutes" },
  { id: "quick-links", label: "Quick links" },
  { id: "quick-links-cheat-sheet", label: "Cheat sheet", depth: 3 },
  { id: "quick-links-practice-sets", label: "Practice sets", depth: 3 },
  { id: "quick-links-formula-bank", label: "Formula bank", depth: 3 },
  { id: "learning-path", label: "Learning path" },
  { id: "daily-rhythm", label: "Daily rhythm" },
  { id: "checkpoints", label: "Checkpoints" },
  { id: "deep-dive", label: "Deep dive" },
  { id: "faq", label: "FAQ" },
  { id: "next-steps", label: "Next steps" },
] as const;

export default function Page() {
  return (
    <LessonFrame tocItems={tocItems}>
      <div className="space-y-12">
        <section className="space-y-2" id="why-us">
          <h1 className="font-semibold text-3xl text-foreground">Why us?</h1>
          <p className="text-muted-foreground">
            Placeholder copy to validate the framing and table of contents
            spacing. This paragraph is intentionally longer so you can see how
            the reading column feels with real scroll length.
          </p>
          <p className="text-muted-foreground">
            Keep the narrative simple and concrete. We want to see the spacing
            between headings, the rhythm of text blocks, and the way the column
            holds up when it grows.
          </p>
          <p className="text-muted-foreground">
            Imagine this as the intro to a lesson or overview of the module.
            Adjust this copy later once the structural framing is verified.
          </p>
        </section>
        <section className="space-y-2" id="get-started-in-5-minutes">
          <h2 className="font-semibold text-2xl text-foreground">
            Get started in 5 minutes
          </h2>
          <p className="text-muted-foreground">
            Drop your real content here and the TOC will align to the right. For
            now, we are stacking paragraphs to generate scrollable length.
          </p>
          <p className="text-muted-foreground">
            Set up your study environment, open your notes, and create a short
            summary prompt. This keeps the warm-up fast and consistent.
          </p>
          <p className="text-muted-foreground">
            The key is that each section has enough height to let you observe
            how the TOC behaves as you scroll through multiple headings.
          </p>
        </section>
        <section className="space-y-2" id="quick-links">
          <h2 className="font-semibold text-2xl text-foreground">
            Quick links
          </h2>
          <p className="text-muted-foreground">
            This is only a scaffold to confirm spacing and layout, but we can
            still simulate links, references, and short bullet summaries.
          </p>
          <p className="text-muted-foreground">
            Add references, exercises, or quick navigation points that help
            someone jump between concept blocks.
          </p>
          <p className="text-muted-foreground">
            The more content we have here, the easier it is to validate the
            framing, spacing, and sticky behavior.
          </p>
          <div className="space-y-6 pt-2">
            <section className="space-y-2">
              <h3
                className="font-semibold text-foreground text-xl"
                id="quick-links-cheat-sheet"
              >
                Cheat sheet
              </h3>
              <p className="text-muted-foreground">
                Keep a one-page cheat sheet with definitions, standard patterns,
                and common mistakes. This gives you a quick review target before
                deeper practice.
              </p>
            </section>
            <section className="space-y-2">
              <h3
                className="font-semibold text-foreground text-xl"
                id="quick-links-practice-sets"
              >
                Practice sets
              </h3>
              <p className="text-muted-foreground">
                Link out to short, medium, and challenge sets. Grouping drills
                by intensity makes it easier to choose based on available time.
              </p>
            </section>
            <section className="space-y-2">
              <h3
                className="font-semibold text-foreground text-xl"
                id="quick-links-formula-bank"
              >
                Formula bank
              </h3>
              <p className="text-muted-foreground">
                Maintain a compact formula list with constraints and edge cases.
                Re-reading this bank after each session improves recall speed.
              </p>
            </section>
          </div>
        </section>
        <section className="space-y-2" id="learning-path">
          <h2 className="font-semibold text-2xl text-foreground">
            Learning path
          </h2>
          <p className="text-muted-foreground">
            Outline a path that starts with intuition and ends with repetition.
            Use this section to test longer paragraphs and multi-line spacing.
          </p>
          <p className="text-muted-foreground">
            Insert a few more sentences to stretch the scroll. The main goal is
            to give you ample room to test the layout visually.
          </p>
        </section>
        <section className="space-y-2" id="daily-rhythm">
          <h2 className="font-semibold text-2xl text-foreground">
            Daily rhythm
          </h2>
          <p className="text-muted-foreground">
            Keep daily sessions short and consistent. This text is a placeholder
            for a longer explanation of pacing.
          </p>
          <p className="text-muted-foreground">
            You can expand this with your own routine and the reminders you
            need. We want the content column to feel steady with longer prose.
          </p>
        </section>
        <section className="space-y-2" id="checkpoints">
          <h2 className="font-semibold text-2xl text-foreground">
            Checkpoints
          </h2>
          <p className="text-muted-foreground">
            Checkpoints help track progress and force recall. This placeholder
            block exists to lengthen the page for layout testing.
          </p>
          <p className="text-muted-foreground">
            Use two or three checkpoints per lesson so the timeline stays
            visible but not overwhelming.
          </p>
        </section>
        <section className="space-y-2" id="deep-dive">
          <h2 className="font-semibold text-2xl text-foreground">Deep dive</h2>
          <p className="text-muted-foreground">
            This is where an extended explanation might live. We're stretching
            the body to verify that scroll behavior and spacing are correct.
          </p>
          <p className="text-muted-foreground">
            Add a few more lines to simulate a longer block of reference text or
            a guided example walkthrough.
          </p>
          <p className="text-muted-foreground">
            If this feels too long later, you can swap in real content.
          </p>
        </section>
        <section className="space-y-2" id="faq">
          <h2 className="font-semibold text-2xl text-foreground">FAQ</h2>
          <p className="text-muted-foreground">
            Use this area to test shorter Q and A style blocks with spacing
            between lines and headings.
          </p>
          <p className="text-muted-foreground">
            Keep the questions concise and the answers compact for scanning.
          </p>
        </section>
        <section className="space-y-2" id="next-steps">
          <h2 className="font-semibold text-2xl text-foreground">Next steps</h2>
          <p className="text-muted-foreground">
            Wrap up the lesson and describe what's next. This closing section
            gives you more scroll depth to evaluate the overall frame.
          </p>
          <p className="text-muted-foreground">
            Once you're satisfied with the layout, replace the placeholders with
            your actual learning content.
          </p>
        </section>
      </div>
    </LessonFrame>
  );
}
