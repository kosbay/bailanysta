export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
}

export function parseHashtags(hashtagsJson?: string | null): string[] {
  if (!hashtagsJson) return [];
  try {
    return JSON.parse(hashtagsJson);
  } catch {
    return [];
  }
}

export function stringifyHashtags(hashtags: string[]): string {
  return JSON.stringify(hashtags);
}

export function formatContent(content: string): string {
  // Replace hashtags with clickable links (for future implementation)
  return content.replace(/#([a-zA-Z0-9_]+)/g, '<span class="text-blue-500 cursor-pointer">#$1</span>');
}
