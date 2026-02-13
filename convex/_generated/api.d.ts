/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as helpers_common from "../helpers/common.js";
import type * as helpers_lessonGroups from "../helpers/lessonGroups.js";
import type * as helpers_lessons from "../helpers/lessons.js";
import type * as helpers_subjects from "../helpers/subjects.js";
import type * as lessonGroups from "../lessonGroups.js";
import type * as lessons from "../lessons.js";
import type * as subjects from "../subjects.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "helpers/common": typeof helpers_common;
  "helpers/lessonGroups": typeof helpers_lessonGroups;
  "helpers/lessons": typeof helpers_lessons;
  "helpers/subjects": typeof helpers_subjects;
  lessonGroups: typeof lessonGroups;
  lessons: typeof lessons;
  subjects: typeof subjects;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
