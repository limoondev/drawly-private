import { type NextRequest, NextResponse } from "next/server"

// This keeps the ADMIN_KEY server-side only
export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

    if (!backendUrl) {
      return NextResponse.json({ success: false, error: "No backend configured" }, { status: 400 })
    }

    const response = await fetch(`${backendUrl}/api/maintenance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use server-side only env var
        Authorization: `Bearer ${process.env.ADMIN_KEY || ""}`,
      },
      body: JSON.stringify(config),
    })

    if (response.ok) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Backend request failed" }, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 })
  }
}
