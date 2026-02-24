export function taskMatchesQuery(title: string, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return true
  return title.toLowerCase().includes(trimmed.toLowerCase())
}
