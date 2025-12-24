import { type NextRequest, NextResponse } from "next/server"

// Sightengine API for image moderation
// Environment variables: SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET

interface SightengineResponse {
  status: string
  request: {
    id: string
    timestamp: number
    operations: number
  }
  nudity?: {
    sexual_activity: number
    sexual_display: number
    erotica: number
    very_suggestive: number
    suggestive: number
    mildly_suggestive: number
    suggestive_classes: {
      bikini: number
      cleavage: number
      male_chest: number
      lingerie: number
      miniskirt: number
      other: number
    }
    none: number
    context: {
      sea_lake_pool: number
      outdoor_other: number
      indoor_other: number
    }
  }
  weapon?: number
  alcohol?: number
  drugs?: number
  offensive?: {
    nazi: number
    confederate: number
    supremacist: number
    terrorist: number
    middle_finger: number
  }
  gore?: {
    prob: number
  }
  text?: {
    profanity: Array<{ text: string }>
    personal: Array<{ text: string }>
    link: Array<{ text: string }>
  }
  faces?: Array<{
    x1: number
    y1: number
    x2: number
    y2: number
    attributes: {
      minor: number
    }
  }>
}

export async function POST(request: NextRequest) {
  try {
    const apiUser = process.env.SIGHTENGINE_API_USER
    const apiSecret = process.env.SIGHTENGINE_API_SECRET

    if (!apiUser || !apiSecret) {
      // If no API keys, allow upload but log warning
      console.warn("[v0] Sightengine API keys not configured, skipping moderation")
      return NextResponse.json({
        approved: true,
        warning: "Moderation non configurée",
        details: null,
      })
    }

    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null
    const imageUrl = formData.get("url") as string | null

    if (!imageFile && !imageUrl) {
      return NextResponse.json({ error: "Image ou URL requise" }, { status: 400 })
    }

    let moderationResult: SightengineResponse

    if (imageUrl) {
      // Moderate by URL
      const params = new URLSearchParams({
        url: imageUrl,
        models: "nudity-2.1,offensive,gore,text-content,face-attributes",
        api_user: apiUser,
        api_secret: apiSecret,
      })

      const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params.toString()}`, { method: "GET" })

      moderationResult = await response.json()
    } else if (imageFile) {
      // Moderate by file upload
      const sightengineFormData = new FormData()
      sightengineFormData.append("media", imageFile)
      sightengineFormData.append("models", "nudity-2.1,offensive,gore,text-content,face-attributes")
      sightengineFormData.append("api_user", apiUser)
      sightengineFormData.append("api_secret", apiSecret)

      const response = await fetch("https://api.sightengine.com/1.0/check.json", {
        method: "POST",
        body: sightengineFormData,
      })

      moderationResult = await response.json()
    } else {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 })
    }

    if (moderationResult.status !== "success") {
      console.error("[v0] Sightengine error:", moderationResult)
      return NextResponse.json({
        approved: true,
        warning: "Erreur de modération, image acceptée par défaut",
        details: null,
      })
    }

    // Analyze results
    const rejectionReasons: string[] = []
    const warningReasons: string[] = []

    // Check nudity
    if (moderationResult.nudity) {
      const nudity = moderationResult.nudity
      if (nudity.sexual_activity > 0.3 || nudity.sexual_display > 0.3 || nudity.erotica > 0.5) {
        rejectionReasons.push("Contenu sexuel détecté")
      } else if (nudity.very_suggestive > 0.5 || nudity.suggestive > 0.7) {
        warningReasons.push("Contenu suggestif détecté")
      }
    }

    // Check offensive content
    if (moderationResult.offensive) {
      const offensive = moderationResult.offensive
      if (
        offensive.nazi > 0.3 ||
        offensive.confederate > 0.3 ||
        offensive.supremacist > 0.3 ||
        offensive.terrorist > 0.3
      ) {
        rejectionReasons.push("Symboles offensants détectés")
      }
      if (offensive.middle_finger > 0.5) {
        warningReasons.push("Geste inapproprié détecté")
      }
    }

    // Check gore
    if (moderationResult.gore && moderationResult.gore.prob > 0.5) {
      rejectionReasons.push("Contenu violent/gore détecté")
    }

    // Check for minors in inappropriate contexts
    if (moderationResult.faces && moderationResult.faces.length > 0) {
      const hasMinor = moderationResult.faces.some((face) => face.attributes?.minor > 0.7)
      if (hasMinor && moderationResult.nudity) {
        const nudity = moderationResult.nudity
        if (nudity.suggestive > 0.3 || nudity.very_suggestive > 0.2) {
          rejectionReasons.push("Protection des mineurs activée")
        }
      }
    }

    // Check for profanity in text
    if (moderationResult.text?.profanity && moderationResult.text.profanity.length > 0) {
      warningReasons.push("Texte inapproprié détecté")
    }

    const approved = rejectionReasons.length === 0
    const warning = warningReasons.length > 0 ? warningReasons.join(", ") : null

    return NextResponse.json({
      approved,
      rejected: !approved,
      rejectionReasons: rejectionReasons.length > 0 ? rejectionReasons : null,
      warning,
      details: {
        nudity: moderationResult.nudity
          ? {
              safe: moderationResult.nudity.none,
              suggestive: moderationResult.nudity.suggestive,
            }
          : null,
        offensive: moderationResult.offensive
          ? {
              detected: Object.entries(moderationResult.offensive)
                .filter(([_, v]) => v > 0.3)
                .map(([k]) => k),
            }
          : null,
        gore: moderationResult.gore?.prob || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Image moderation error:", error)
    return NextResponse.json({
      approved: true,
      warning: "Erreur de modération",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
