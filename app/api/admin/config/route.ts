import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  return createClient(url, key)
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      // Return default config if Supabase is not configured
      return NextResponse.json({
        id: "main",
        backend_url: null,
        maintenance_mode: false,
        maintenance_message: "Le serveur est en maintenance.",
        maintenance_severity: "info",
        backend_online: false,
      })
    }

    const { data, error } = await supabaseAdmin.from("server_config").select("*").eq("id", "main").single()

    if (error) {
      console.error("[v0] Error fetching config:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("[v0] Exception fetching config:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { backend_url, maintenance_mode, maintenance_message, maintenance_severity, backend_online } = body

    console.log("[v0] Saving config:", { backend_url, maintenance_mode, backend_online })

    const { data, error } = await supabaseAdmin
      .from("server_config")
      .upsert(
        {
          id: "main",
          backend_url: backend_url ?? null,
          maintenance_mode: maintenance_mode ?? false,
          maintenance_message: maintenance_message ?? "Le serveur est en maintenance.",
          maintenance_severity: maintenance_severity ?? "info",
          backend_online: backend_online ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving config:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Config saved successfully:", data)
    return NextResponse.json(data)
  } catch (err) {
    console.error("[v0] Exception saving config:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }

    const body = await request.json()

    console.log("[v0] Updating config with:", body)

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.backend_url !== undefined) updateData.backend_url = body.backend_url
    if (body.maintenance_mode !== undefined) updateData.maintenance_mode = body.maintenance_mode
    if (body.maintenance_message !== undefined) updateData.maintenance_message = body.maintenance_message
    if (body.maintenance_severity !== undefined) updateData.maintenance_severity = body.maintenance_severity
    if (body.backend_online !== undefined) updateData.backend_online = body.backend_online

    const { data, error } = await supabaseAdmin
      .from("server_config")
      .update(updateData)
      .eq("id", "main")
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating config:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Config updated successfully:", data)
    return NextResponse.json(data)
  } catch (err) {
    console.error("[v0] Exception updating config:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
