import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AccountSettings } from "@/components/account-settings"

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <AccountSettings user={user} profile={profile} />
}
