import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { normalizeRequired } from "./helpers/common";
import {
  assertUniqueSubjectSlug,
  assertUniqueSubjectUid,
  getNextSubjectOrder,
} from "./helpers/subjects";

const subjectValidator = v.object({
  _id: v.id("subjects"),
  _creationTime: v.number(),
  uid: v.string(),
  name: v.string(),
  slug: v.string(),
  description: v.union(v.string(), v.null()),
  order: v.number(),
});
const subjectMutationResultValidator = v.object({
  _id: v.id("subjects"),
  uid: v.string(),
  name: v.string(),
  slug: v.string(),
  description: v.union(v.string(), v.null()),
  order: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(subjectValidator),
  handler: async (ctx) => {
    return await ctx.db.query("subjects").withIndex("by_order").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(subjectValidator, v.null()),
  handler: async (ctx, args) => {
    const slug = normalizeRequired(args.slug, "slug");
    return await ctx.db
      .query("subjects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    uid: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.union(v.string(), v.null())),
  },
  returns: subjectMutationResultValidator,
  handler: async (ctx, args) => {
    const uid = normalizeRequired(args.uid, "uid");
    const name = normalizeRequired(args.name, "name");
    const slug = normalizeRequired(args.slug, "slug");

    await Promise.all([
      assertUniqueSubjectUid(ctx.db, uid),
      assertUniqueSubjectSlug(ctx.db, slug),
    ]);

    const order = await getNextSubjectOrder(ctx.db);
    const description = args.description?.trim() ?? null;

    const subjectId = await ctx.db.insert("subjects", {
      uid,
      name,
      slug,
      description,
      order,
    });

    return {
      _id: subjectId,
      uid,
      name,
      slug,
      description,
      order,
    };
  },
});

export const update = mutation({
  args: {
    subjectId: v.id("subjects"),
    uid: v.optional(v.string()),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
  },
  returns: subjectMutationResultValidator,
  handler: async (ctx, args) => {
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error(`Subject "${args.subjectId}" was not found.`);
    }

    const patch: {
      description?: string | null;
      name?: string;
      slug?: string;
      uid?: string;
    } = {};

    if (args.uid !== undefined) {
      const uid = normalizeRequired(args.uid, "uid");
      if (uid !== subject.uid) {
        await assertUniqueSubjectUid(ctx.db, uid, subject._id);
      }
      patch.uid = uid;
    }

    if (args.name !== undefined) {
      patch.name = normalizeRequired(args.name, "name");
    }

    if (args.slug !== undefined) {
      const slug = normalizeRequired(args.slug, "slug");
      if (slug !== subject.slug) {
        await assertUniqueSubjectSlug(ctx.db, slug, subject._id);
      }
      patch.slug = slug;
    }

    if (args.description !== undefined) {
      patch.description = args.description?.trim() ?? null;
    }

    await ctx.db.patch(subject._id, patch);
    return {
      _id: subject._id,
      uid: patch.uid ?? subject.uid,
      name: patch.name ?? subject.name,
      slug: patch.slug ?? subject.slug,
      description: patch.description ?? subject.description,
      order: subject.order,
    };
  },
});
