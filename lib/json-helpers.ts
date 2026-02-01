// Helper functions to convert between arrays and JSON strings for SQLite compatibility

export function arrayToJson(arr: string[]): string {
  return JSON.stringify(arr);
}

export function jsonToArray(json: string | null | undefined): string[] {
  if (!json || json === '') return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Check if JSON string contains any of the search tags
export function jsonContainsAny(json: string, searchTags: string[]): boolean {
  const tags = jsonToArray(json);
  return searchTags.some(tag => tags.includes(tag));
}

