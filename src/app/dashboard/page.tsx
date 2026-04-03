import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/repositories/auth'
import { getProfileWithLinksByUserId } from '@/lib/repositories/profiles'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { user } = await getUser(supabase)

  if (!user) redirect('/auth')

  const profile = await getProfileWithLinksByUserId(supabase, user.id)
  if (!profile) redirect('/auth')

  return <DashboardClient initialProfile={profile} />
}
