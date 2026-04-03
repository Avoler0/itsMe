'use client'

import { Download } from 'lucide-react'
import { downloadVCard } from '@/lib/vcf'
import type { Profile } from '@/types'

interface Props {
  profile: Profile
  vcardBtnClass: string
  buttonColor?: string
}

export default function VCardButton({ profile, vcardBtnClass, buttonColor }: Props) {
  const btnStyle = buttonColor
    ? { backgroundColor: buttonColor, borderColor: buttonColor, color: '#fff' }
    : undefined
  return (
    <button
      onClick={() => downloadVCard(profile)}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${btnStyle ? '' : vcardBtnClass}`}
      style={btnStyle}
    >
      <Download size={14} />
      연락처 저장
    </button>
  )
}
