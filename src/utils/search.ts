export function taskMatchesQuery(title: string, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return true
  return title.toLowerCase().includes(trimmed.toLowerCase())
}

export interface TextSegment {
  text: string
  highlight: boolean
}

export function splitHighlight(text: string, query: string): TextSegment[] {
  const trimmed = query.trim()
  if (!trimmed) return [{ text, highlight: false }]

  const lower = text.toLowerCase()
  const lowerQuery = trimmed.toLowerCase()
  const segments: TextSegment[] = []
  let lastIndex = 0

  let index = lower.indexOf(lowerQuery, lastIndex)
  while (index !== -1) {
    if (index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, index), highlight: false })
    }
    segments.push({ text: text.slice(index, index + trimmed.length), highlight: true })
    lastIndex = index + trimmed.length
    index = lower.indexOf(lowerQuery, lastIndex)
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlight: false })
  }

  return segments
}
