import type { Profile } from "@/types";

/** vCard 필드 인젝션 방지: 개행 문자 제거 */
function sanitize(value: string): string {
  return value.replace(/[\r\n]/g, ' ').trim()
}

/**
 * Profile 정보를 .vcf (vCard) 형식으로 변환하여 다운로드합니다.
 * 클릭 한 번에 휴대폰 주소록에 저장됩니다.
 */
export function downloadVCard(profile: Profile) {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${sanitize(profile.display_name)}`,
    `N:${sanitize(profile.display_name)};;;;`,
  ];

  if (profile.phone) {
    lines.push(`TEL;TYPE=CELL:${sanitize(profile.phone)}`);
  }

  if (profile.email) {
    lines.push(`EMAIL:${sanitize(profile.email)}`);
  }

  if (profile.bio) {
    lines.push(`NOTE:${sanitize(profile.bio)}`);
  }

  if (profile.avatar_url) {
    lines.push(`PHOTO;VALUE=URI:${sanitize(profile.avatar_url)}`);
  }

  lines.push(`URL:${window.location.origin}/${profile.username}`);
  lines.push("END:VCARD");

  const vcfContent = lines.join("\r\n");
  const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.username}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
