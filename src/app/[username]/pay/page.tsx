import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaymentProfile } from '@/lib/repositories/profiles'
import PayClient from './PayClient'

export default async function PayPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const profile = await getPaymentProfile(supabase, username)

  if (!profile) notFound()

  const hasPaymentInfo =
    profile.bank_name || profile.kakao_pay_url || profile.toss_url

  if (!hasPaymentInfo) notFound()

  return <PayClient profile={profile} />
}
