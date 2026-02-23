export const COLUMN_ACCENT_COLORS = [
  '#388bfd', // blue
  '#3fb950', // green
  '#d29922', // amber
  '#f85149', // red
  '#bc8cff', // purple
  '#39c5cf', // teal
  '#f778ba', // pink
  '#ff9500', // orange
] as const

export type AccentColor = (typeof COLUMN_ACCENT_COLORS)[number]
