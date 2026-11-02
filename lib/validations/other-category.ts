import type { z } from "zod";
import { OTHER_OPTION, OTHER_TEXT_MAX_LENGTH } from "../form-options";
import { optionalText, requiredText } from "./common";

export const otherCategoryFields = {
  category: requiredText("Category", OTHER_TEXT_MAX_LENGTH),
  categoryOther: optionalText(OTHER_TEXT_MAX_LENGTH, "Other category"),
};

type CategoryInput = { category: string; categoryOther: string | null };

export function validateOtherCategory(data: CategoryInput, ctx: z.RefinementCtx) {
  if (data.category === OTHER_OPTION && !data.categoryOther) {
    ctx.addIssue({ code: "custom", path: ["categoryOther"], message: "Please enter your category." });
  }
}

/** Persist the custom label in the existing category column, not the form-only field. */
export function resolveOtherCategory<T extends CategoryInput>(data: T) {
  const { categoryOther, ...values } = data;
  return { ...values, category: data.category === OTHER_OPTION ? categoryOther! : data.category };
}
