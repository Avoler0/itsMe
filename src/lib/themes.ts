export type ThemeKey = 'default' | 'stone' | 'sage' | 'warm' | 'sky' | 'dark'
export type TextColorKey = 'black' | 'white' | 'slate'

// ─── 배경 테마 ────────────────────────────────────────────────
export interface ThemeConfig {
  label: string
  swatchColor: string   // hex (Tailwind purge 방지)
  swatchBorder: boolean
  pageBg: string        // Tailwind class (커스텀이면 '')
  cardBg: string        // Tailwind class (커스텀이면 '')
  cardColor: string     // hex — 항상 inline style로 적용
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  default: { label: '화이트', swatchColor: '#ffffff', swatchBorder: true,  pageBg: 'bg-neutral-50',  cardBg: 'bg-white',     cardColor: '#ffffff' },
  stone:   { label: '스톤',   swatchColor: '#e7e5e4', swatchBorder: false, pageBg: 'bg-stone-100',   cardBg: 'bg-stone-50',  cardColor: '#fafaf9' },
  sage:    { label: '세이지', swatchColor: '#bbf7d0', swatchBorder: false, pageBg: 'bg-emerald-50',  cardBg: 'bg-white',     cardColor: '#ffffff' },
  warm:    { label: '웜',     swatchColor: '#fde68a', swatchBorder: false, pageBg: 'bg-amber-50',    cardBg: 'bg-white',     cardColor: '#ffffff' },
  sky:     { label: '스카이', swatchColor: '#bae6fd', swatchBorder: false, pageBg: 'bg-sky-50',      cardBg: 'bg-white',     cardColor: '#ffffff' },
  dark:    { label: '다크',   swatchColor: '#18181b', swatchBorder: false, pageBg: 'bg-zinc-950',    cardBg: 'bg-zinc-900',  cardColor: '#18181b' },
}

// ─── 텍스트 컬러 ──────────────────────────────────────────────
export interface TextColorConfig {
  label: string
  swatchColor: string
  swatchBorder: boolean
}

export const TEXT_COLORS: Record<TextColorKey, TextColorConfig> = {
  black: { label: '블랙',     swatchColor: '#171717', swatchBorder: false },
  white: { label: '화이트',   swatchColor: '#ffffff', swatchBorder: true  },
  slate: { label: '슬레이트', swatchColor: '#64748b', swatchBorder: false },
}

// TextColorKey → 실제 hex 값 (inline style 적용용)
export const TEXT_COLOR_HEX: Record<TextColorKey, string> = {
  black: '#171717',
  white: '#ffffff',
  slate: '#64748b',
}

// ─── 헬퍼 ─────────────────────────────────────────────────────

/** hex 색상이 어두운지 (luminance < 0.5) */
export function isDarkColor(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5
}

export function getTheme(key: string | null | undefined): ThemeConfig {
  const k = key ?? 'default'
  if (k.startsWith('#')) {
    return { label: '커스텀', swatchColor: k, swatchBorder: false, pageBg: '', cardBg: '', cardColor: k }
  }
  return THEMES[(k as ThemeKey)] ?? THEMES.default
}

/** TextColorKey 또는 커스텀 hex → 실제 hex 반환 */
export function resolveTextColorHex(key: string | null | undefined): string {
  const k = key ?? 'black'
  if (k.startsWith('#')) return k
  return TEXT_COLOR_HEX[(k as TextColorKey)] ?? TEXT_COLOR_HEX.black
}

/**
 * 카드 배경이 밝은지 여부를 받아 UI 클래스 세트를 반환.
 * 텍스트 색상은 카드 wrapper의 style={{ color }} 로 상속되므로
 * 여기서는 opacity 기반 클래스만 사용 (명시적 text-* 클래스 없음).
 */
export function buildThemeClasses(bgIsLight: boolean) {
  return {
    name:         '',
    username:     'opacity-50',
    bio:          'opacity-60',
    contact:      'opacity-50 hover:opacity-80 transition-opacity',
    linkTitle:    '',
    linkArrow:    'opacity-25 group-hover:opacity-50 transition-opacity',
    footer:       'opacity-20',
    divider:      bgIsLight ? 'bg-black/10'  : 'bg-white/20',
    linkHover:    bgIsLight ? 'border border-black/10 hover:bg-black/5 active:bg-black/10'   : 'border border-white/20 hover:bg-white/10 active:bg-white/20',
    linkIconBg:   bgIsLight ? 'bg-black/10'  : 'bg-white/20',
    bottomBorder: bgIsLight ? 'border-black/10' : 'border-white/20',
    vcardBtn:     bgIsLight
      ? 'border-black/20 hover:bg-black/5 hover:border-black/30'
      : 'border-white/30 hover:bg-white/10 hover:border-white/50',
  }
}

// 하위 호환용 — getTextColor는 대시보드 색상 피커에서 현재 key 표시에 사용
export function getTextColor(key: string | null | undefined): string {
  const k = key ?? 'black'
  if (k.startsWith('#')) return k
  return (k as TextColorKey) in TEXT_COLORS ? k : 'black'
}
