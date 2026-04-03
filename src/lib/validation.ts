export const VALID_IMAGE_MIMES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const VALID_LINK_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:']

export const MAX_LENGTHS = {
  display_name:   100,
  username:        30,
  bio:            300,
  phone:           20,
  email:          255,
  bank_name:       50,
  account_holder:  50,
  account_number:  50,
  kakao_pay_url:  500,
  toss_url:       500,
  link_title:     100,
  link_url:      2048,
}

export function validateImageFile(file: File): string | null {
  if (!VALID_IMAGE_MIMES[file.type]) return '지원하지 않는 파일 형식이에요 (jpg, png, webp, gif만 가능)'
  if (file.size > MAX_FILE_SIZE) return '파일 크기는 5MB 이하여야 해요'
  return null
}

export function isValidLinkUrl(url: string): boolean {
  try {
    return VALID_LINK_PROTOCOLS.includes(new URL(url).protocol)
  } catch {
    return false
  }
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}
