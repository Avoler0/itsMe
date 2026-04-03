/**
 * URL을 분석해 어울리는 아이콘 이름을 자동 반환합니다.
 * Lucide React 아이콘 이름과 대응합니다.
 */
export function detectIcon(url: string): string {
  const lower = url.toLowerCase();

  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("github.com")) return "github";
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("facebook.com")) return "facebook";
  if (lower.includes("tiktok.com")) return "music";
  if (lower.includes("notion.so")) return "file-text";
  if (lower.includes("mailto:")) return "mail";
  if (lower.includes("tel:")) return "phone";

  return "link";
}

export const ICON_MAP: Record<string, string> = {
  instagram: "Instagram",
  youtube: "Youtube",
  twitter: "Twitter",
  github: "Github",
  linkedin: "Linkedin",
  facebook: "Facebook",
  music: "Music",
  "file-text": "FileText",
  mail: "Mail",
  phone: "Phone",
  link: "Link",
};
