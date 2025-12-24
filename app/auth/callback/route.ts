import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  if (error) {
    console.log("[v0] Auth callback error:", error, errorDescription)
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`,
    )
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.log("[v0] Exchange error:", exchangeError.message)
      return NextResponse.redirect(
        `${origin}/auth/error?error=exchange_failed&description=${encodeURIComponent(exchangeError.message)}`,
      )
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          username: data.user.user_metadata?.username || data.user.email?.split("@")[0] || "Player",
          display_name: data.user.user_metadata?.display_name || data.user.user_metadata?.username || "Player",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (profileError) {
        console.log("[v0] Profile upsert error:", profileError.message)
      }
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/auth/error?error=no_code&description=No verification code provided`)
}
