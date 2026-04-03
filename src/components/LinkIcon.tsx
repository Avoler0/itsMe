import {
  Link2,
  Instagram,
  Youtube,
  Github,
  Linkedin,
  Music,
  FileText,
  Mail,
  Phone,
  Twitter,
  Facebook,
} from 'lucide-react'

const LUCIDE_MAP: Record<string, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  music: Music,
  'file-text': FileText,
  mail: Mail,
  phone: Phone,
  link: Link2,
}

interface Props {
  icon: string | null
  size?: number
  className?: string
}

/**
 * icon이 http(s):// 로 시작하면 → 업로드된 이미지
 * 그 외엔 → Lucide 아이콘 (키워드 매핑)
 */
export default function LinkIcon({ icon, size = 14, className = 'text-neutral-500' }: Props) {
  const key = icon ?? 'link'

  if (key.startsWith('http')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={key}
        alt="icon"
        width={size}
        height={size}
        className="object-contain"
      />
    )
  }

  const Icon = LUCIDE_MAP[key] ?? Link2
  return <Icon size={size} className={className} />
}
