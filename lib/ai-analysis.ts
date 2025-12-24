export interface BehaviorAnalysis {
  isCheat: boolean
  confidence: number
  reasons: string[]
  detectedPatterns: string[]
  recommendation: "allow" | "warn" | "ban"
  aiResponse: string
}

export interface PlayerBehavior {
  messageHistory: { message: string; timestamp: number }[]
  guessPatterns: { word: string; timeToGuess: number }[]
  pasteEvents: number
  suspiciousPatterns: string[]
  warningCount: number
}

const USERSCRIPT_PATTERNS = [
  /tampermonkey/i,
  /greasemonkey/i,
  /violentmonkey/i,
  /userscript/i,
  /==UserScript==/i,
  /@grant/i,
  /@require/i,
  /GM_/,
  /unsafeWindow/,
]

export function detectUserscript(): { detected: boolean; evidence: string[] } {
  const evidence: string[] = []

  if (typeof window === "undefined") return { detected: false, evidence }

  // Check for common userscript manager globals
  const suspiciousGlobals = ["GM", "GM_info", "GM_getValue", "GM_setValue", "GM_xmlhttpRequest", "unsafeWindow"]
  for (const global of suspiciousGlobals) {
    if (global in window) {
      evidence.push(`Global "${global}" detected`)
    }
  }

  // Check for Tampermonkey/Greasemonkey specific
  if ((window as Record<string, unknown>).TM_info) evidence.push("Tampermonkey detected")
  if ((window as Record<string, unknown>).GM_info) evidence.push("Greasemonkey/Userscript manager detected")

  // Check for script injections in DOM
  const scripts = document.querySelectorAll("script")
  scripts.forEach((script) => {
    const src = script.src || ""
    const content = script.textContent || ""

    for (const pattern of USERSCRIPT_PATTERNS) {
      if (pattern.test(src) || pattern.test(content)) {
        evidence.push(`Suspicious script pattern: ${pattern.source}`)
      }
    }
  })

  // Check for modified prototypes (common in cheats)
  try {
    const originalToString = Function.prototype.toString
    if (originalToString.toString().includes("native code") === false) {
      evidence.push("Function.prototype.toString modified")
    }
  } catch {
    evidence.push("Unable to verify Function prototype")
  }

  try {
    if ((window as Record<string, unknown>).__WEBSOCKET_ORIGINAL__) {
      evidence.push("WebSocket interception detected")
    }
  } catch {}

  const suspiciousStyles = document.querySelectorAll("style[data-userscript], style[data-tampermonkey]")
  if (suspiciousStyles.length > 0) {
    evidence.push("Userscript-injected styles detected")
  }

  return {
    detected: evidence.length > 0,
    evidence,
  }
}

export function analyzeBehavior(
  behavior: PlayerBehavior,
  currentMessage: string,
  currentWord: string,
): BehaviorAnalysis {
  const reasons: string[] = []
  const detectedPatterns: string[] = []
  let confidence = 0

  const now = Date.now()
  const recentMessages = behavior.messageHistory.filter((m) => now - m.timestamp < 5000)

  const userscriptCheck = detectUserscript()
  if (userscriptCheck.detected) {
    reasons.push(`Userscript detecte: ${userscriptCheck.evidence.join(", ")}`)
    detectedPatterns.push("USERSCRIPT_DETECTED")
    confidence += 90 // High confidence for userscript
  }

  if (recentMessages.length >= 12) {
    reasons.push(`Spam intensif detecte: ${recentMessages.length} messages en 5 secondes`)
    detectedPatterns.push("SPAM_INTENSE")
    confidence += 40
  } else if (recentMessages.length >= 10) {
    // Just a warning, not a ban trigger
    reasons.push(`Spam modere: ${recentMessages.length} messages en 5 secondes`)
    detectedPatterns.push("SPAM_WARNING")
    confidence += 15
  }

  const duplicates = recentMessages.filter((m) => m.message.toLowerCase() === currentMessage.toLowerCase())
  if (duplicates.length >= 6) {
    reasons.push(`Messages dupliques excessifs: ${duplicates.length} fois`)
    detectedPatterns.push("DUPLICATE_SPAM")
    confidence += 30
  }

  // Bot speed detection - very inhuman speed
  const lastMessage = behavior.messageHistory[behavior.messageHistory.length - 1]
  if (lastMessage && now - lastMessage.timestamp < 30) {
    reasons.push("Vitesse de frappe inhumaine (< 30ms entre messages)")
    detectedPatterns.push("BOT_SPEED")
    confidence += 60
  }

  // Suspicious characters (control characters, scripts)
  if (/[\u0000-\u001F\u007F-\u009F]/.test(currentMessage)) {
    reasons.push("Caracteres de controle suspects detectes")
    detectedPatterns.push("SCRIPT_INJECTION")
    confidence += 70
  }

  if (behavior.pasteEvents > 8) {
    reasons.push(`Collages excessifs: ${behavior.pasteEvents} fois`)
    detectedPatterns.push("PASTE_ABUSE")
    confidence += 25
  }

  // Direct word match via suspicious means
  if (currentWord) {
    const normalizedGuess = currentMessage
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    const normalizedWord = currentWord
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    // Check if correct guess came suspiciously fast - only if multiple instant guesses
    if (normalizedGuess === normalizedWord) {
      const instantGuesses = behavior.guessPatterns.filter((g) => g.timeToGuess < 1000)
      if (instantGuesses.length >= 4) {
        reasons.push(`${instantGuesses.length} devinettes instantanees (< 1s) sur plusieurs rounds`)
        detectedPatterns.push("INSTANT_GUESS")
        confidence += 55
      }
    }
  }

  // Previous warnings add up slowly
  if (behavior.warningCount >= 4) {
    confidence += 20
    reasons.push(`Avertissements precedents: ${behavior.warningCount}`)
  }

  let recommendation: "allow" | "warn" | "ban" = "allow"
  if (confidence >= 80) {
    recommendation = "ban"
  } else if (confidence >= 55) {
    recommendation = "warn"
  }

  const aiResponse = generateAIResponse(detectedPatterns, confidence, recommendation)

  return {
    isCheat: confidence >= 80,
    confidence: Math.min(100, confidence),
    reasons,
    detectedPatterns,
    recommendation,
    aiResponse,
  }
}

function generateAIResponse(patterns: string[], confidence: number, recommendation: "allow" | "warn" | "ban"): string {
  if (patterns.length === 0) {
    return "Aucun comportement suspect detecte. Continuez a jouer !"
  }

  const patternMessages: Record<string, string> = {
    SPAM_INTENSE: "envoi de messages extremement rapide (spam intensif)",
    SPAM_WARNING: "envoi de messages rapides (attention)",
    DUPLICATE_SPAM: "envoi massif de messages identiques",
    BOT_SPEED: "vitesse de frappe inhumaine suggérant un bot",
    SCRIPT_INJECTION: "tentative d'injection de script malveillant",
    PASTE_ABUSE: "utilisation excessive du copier-coller",
    INSTANT_GUESS: "devinettes instantanees repetees",
    USERSCRIPT_DETECTED: "extension de triche (Userscript) detectee",
    WORD_PASTE: "copie directe du mot",
  }

  const detectedBehaviors = patterns.map((p) => patternMessages[p] || p).join(", ")

  if (recommendation === "ban") {
    return `Notre systeme Kiwiz Protect IA a detecte avec ${confidence}% de certitude: ${detectedBehaviors}. Ces comportements sont caracteristiques d'un Userscript ou d'une triche. Vous avez ete temporairement exclu.`
  }

  if (recommendation === "warn") {
    return `Attention (${confidence}% de certitude): ${detectedBehaviors}. Ceci est un avertissement. Ralentissez vos messages pour eviter d'etre exclu.`
  }

  return `Analyse terminee. Niveau de risque: faible.`
}

// Process contestation with AI
export async function processContestation(
  behavior: PlayerBehavior,
  userMessage: string,
): Promise<{
  accepted: boolean
  response: string
  analysis: string
}> {
  const patternsSummary = behavior.suspiciousPatterns.join(", ") || "Aucun"
  const msgCount = behavior.messageHistory.length
  const pasteCount = behavior.pasteEvents

  await new Promise((resolve) => setTimeout(resolve, 1500))

  const hasSpam = behavior.suspiciousPatterns.some((p) => p.includes("SPAM"))
  const hasUserscript = behavior.suspiciousPatterns.includes("USERSCRIPT_DETECTED")
  const hasHardEvidence = behavior.suspiciousPatterns.some((p) =>
    ["SCRIPT_INJECTION", "BOT_SPEED", "USERSCRIPT_DETECTED"].includes(p),
  )

  const analysisText = `
**Analyse comportementale du joueur:**

**Activite:**
- Messages envoyes: ${msgCount}
- Evenements de collage: ${pasteCount}
- Avertissements: ${behavior.warningCount}

**Patterns detectes:**
${behavior.suspiciousPatterns.map((p) => `- ${p}`).join("\n") || "- Aucun"}

${hasSpam ? `**Note:** Le joueur a ete detecte pour SPAM (envoi rapide de messages). Cela peut etre du a un comportement legitime (excitation, tentatives multiples) ou a un bot. Le systeme est maintenant plus tolerant.` : ""}

${hasUserscript ? `**ALERTE CRITIQUE:** Un Userscript ou extension de triche a ete detecte dans le navigateur du joueur. C'est une preuve directe de triche.` : ""}

**Verdict:** ${hasUserscript ? "Preuve directe de triche (Userscript)" : hasHardEvidence ? "Preuves solides de triche" : hasSpam ? "Comportement de spam detecte - peut etre legitime" : "Preuves insuffisantes"}
  `.trim()

  // Userscript = definite reject
  if (hasUserscript) {
    return {
      accepted: false,
      response: `Un Userscript ou une extension de triche a ete detecte dans votre navigateur. Ce type de logiciel est strictement interdit et constitue une preuve directe de triche. Votre contestation est refusee. Desactivez completement toutes les extensions de triche (Tampermonkey, Greasemonkey, etc.) pour rejouer.`,
      analysis: analysisText,
    }
  }

  // Hard evidence without userscript
  if (hasHardEvidence) {
    return {
      accepted: false,
      response: `Apres analyse approfondie, nous confirmons que des patterns de triche ont ete detectes (${behavior.suspiciousPatterns.filter((p) => !p.includes("SPAM")).join(", ")}). Votre contestation est refusee car les preuves sont solides.`,
      analysis: analysisText,
    }
  }

  if (hasSpam && behavior.warningCount <= 2) {
    return {
      accepted: true,
      response: `Nous avons examine votre cas. Le ban etait base sur du spam (messages rapides). Apres reflection, nous reconnaissons que cela peut arriver lors de moments intenses du jeu. Votre ban est leve ! Essayez tout de meme de ralentir vos messages a l'avenir pour eviter de declencher le systeme.`,
      analysis: analysisText,
    }
  }

  // Only spam patterns and low warnings - accept
  if (hasSpam && !hasHardEvidence) {
    return {
      accepted: true,
      response: `Votre contestation a ete acceptee. Le spam peut etre un comportement legitime lors d'un jeu excitant. Votre ban est leve. Nous vous recommandons de moderer votre rythme de messages.`,
      analysis: analysisText,
    }
  }

  // Soft evidence - likely false positive
  if (behavior.warningCount <= 2 && behavior.pasteEvents < 8) {
    return {
      accepted: true,
      response: `Apres examen approfondi de votre cas, nous avons determine que votre ban etait probablement un faux positif. Votre ban a ete leve. Merci de votre patience et bon jeu !`,
      analysis: analysisText,
    }
  }

  return {
    accepted: false,
    response: `Votre contestation a ete analysee. Les donnees (${msgCount} messages, ${pasteCount} collages, patterns: ${patternsSummary}) suggerent une activite trop suspecte. Le ban est maintenu. Vous pourrez rejouer dans quelques minutes.`,
    analysis: analysisText,
  }
}

export function getAIChatbotResponse(userMessage: string, context: { isBanned: boolean; patterns: string[] }): string {
  const lowerMessage = userMessage.toLowerCase()

  // Greetings
  if (lowerMessage.match(/^(bonjour|salut|hello|hi|hey|coucou)/)) {
    return "Bonjour ! Je suis l'assistant Kiwiz Protect IA. Comment puis-je vous aider ? Vous pouvez me poser des questions sur le systeme anti-triche, votre ban, ou comment jouer."
  }

  // Ban related
  if (
    lowerMessage.includes("ban") ||
    lowerMessage.includes("exclu") ||
    lowerMessage.includes("kick") ||
    lowerMessage.includes("pourquoi")
  ) {
    if (context.isBanned) {
      const patternExplanations: Record<string, string> = {
        SPAM_INTENSE: "Vous avez envoye trop de messages trop rapidement (plus de 12 en 5 secondes)",
        SPAM_WARNING: "Vous avez envoye des messages un peu trop vite",
        DUPLICATE_SPAM: "Vous avez envoye le meme message plus de 6 fois",
        BOT_SPEED: "La vitesse de vos messages etait inhumainement rapide (moins de 30ms)",
        USERSCRIPT_DETECTED: "Une extension de triche (Tampermonkey/Greasemonkey) a ete detectee",
        PASTE_ABUSE: "Vous avez utilise le copier-coller plus de 8 fois",
        INSTANT_GUESS: "Vous avez devine plusieurs mots instantanement de maniere suspecte",
      }

      const explanations = context.patterns.map((p) => patternExplanations[p] || p).join(". ")
      return `Vous avez ete banni pour: ${explanations}. Si vous pensez que c'est une erreur (surtout pour le spam), utilisez le bouton "Contester" - notre systeme est maintenant plus comprehensif pour les faux positifs !`
    }
    return "Le systeme de ban protege les joueurs contre la triche. Les bans sont temporaires (5 minutes) et facilement contestables si c'est un faux positif. Les vraies raisons de ban: utilisation de scripts, vitesse de frappe inhumaine (<30ms), spam extreme (12+ messages/5s)."
  }

  // Anti-cheat explanation
  if (
    lowerMessage.includes("anti-triche") ||
    lowerMessage.includes("kiwiz") ||
    lowerMessage.includes("protect") ||
    lowerMessage.includes("comment ca marche") ||
    lowerMessage.includes("fonctionne")
  ) {
    return "Kiwiz Protect v3 est notre systeme anti-triche base sur l'IA. Il detecte principalement: 1) Les Userscripts (Tampermonkey, etc.) - detection automatique, 2) Les vitesses de frappe inhumaines (<30ms), 3) Le spam extreme (12+ messages en 5 secondes), 4) Les injections de script. Le systeme est calibre pour etre tolerant avec les joueurs legitimes excites !"
  }

  // Userscript
  if (
    lowerMessage.includes("userscript") ||
    lowerMessage.includes("script") ||
    lowerMessage.includes("tampermonkey") ||
    lowerMessage.includes("greasemonkey") ||
    lowerMessage.includes("extension")
  ) {
    return "Les Userscripts et extensions comme Tampermonkey/Greasemonkey sont strictement interdits. Notre systeme les detecte automatiquement en scannant les globales JavaScript suspectes (GM_, unsafeWindow, etc.). Si vous en avez un installe, desactivez-le COMPLETEMENT (pas juste sur ce site) avant de jouer. C'est la seule raison de ban non-contestable."
  }

  // How to play
  if (lowerMessage.includes("jouer") || lowerMessage.includes("regles") || lowerMessage.includes("comment")) {
    return "Drawly est simple ! Un joueur dessine un mot secret, les autres doivent le deviner en tapant dans le chat. Plus vous trouvez vite, plus vous gagnez de points (100 + bonus temps). Le dessinateur gagne 25 points par bonne reponse. Vous pouvez envoyer plusieurs messages pour deviner - le systeme anti-triche est tolerant !"
  }

  // Contestation
  if (
    lowerMessage.includes("contester") ||
    lowerMessage.includes("appel") ||
    lowerMessage.includes("injuste") ||
    lowerMessage.includes("erreur")
  ) {
    return "Pour contester un ban, cliquez sur 'Contester mon ban'. Notre IA analysera votre comportement. Les bans pour spam sont souvent des faux positifs (excitation du jeu) et sont generalement acceptes en contestation. Seuls les bans pour Userscript detecte sont non-contestables car c'est une preuve directe."
  }

  // Spam specific
  if (lowerMessage.includes("spam")) {
    return "Le spam est detecte quand vous envoyez plus de 12 messages en 5 secondes, ou 6+ messages identiques. C'est tres tolerant ! Si vous avez ete banni pour spam, contestez - c'est probablement un faux positif et sera accepte. On comprend que dans l'excitation du jeu, on peut envoyer beaucoup de messages."
  }

  // Version / updates
  if (lowerMessage.includes("version") || lowerMessage.includes("mise a jour") || lowerMessage.includes("nouveau")) {
    return "Drawly v1.106.1 inclut: Kiwiz Protect IA v3 avec detection automatique des Userscripts, un systeme anti-spam beaucoup plus tolerant (12 msg/5s au lieu de 5), des contestations plus justes, et une meilleure synchronisation multijoueur. Consultez les patch notes sur la page d'accueil !"
  }

  // Default
  return "Je suis l'assistant Kiwiz Protect IA v3. Je peux vous aider avec: le fonctionnement de l'anti-triche, pourquoi vous avez ete banni, comment contester (tres facile pour les faux positifs !), les regles du jeu, ou les Userscripts interdits. Que voulez-vous savoir ?"
}
