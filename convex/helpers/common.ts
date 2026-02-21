export const normalizeRequired = (value: string, fieldName: string): string => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }
  return normalized;
};

export const slugifyValue = (value: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : "untitled";
};
