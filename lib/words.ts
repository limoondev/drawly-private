export const DRAWABLE_WORDS = [
  // Animals
  "chat",
  "chien",
  "oiseau",
  "poisson",
  "lapin",
  "souris",
  "elephant",
  "lion",
  "tigre",
  "ours",
  "serpent",
  "grenouille",
  "papillon",
  "abeille",
  "escargot",
  "tortue",
  "canard",
  "poule",
  "cochon",
  "vache",
  "cheval",
  "mouton",
  "chevre",
  "singe",
  "girafe",
  "pingouin",
  "dauphin",
  "requin",
  "baleine",
  "crabe",

  // Food
  "pizza",
  "gateau",
  "glace",
  "pomme",
  "banane",
  "orange",
  "fraise",
  "cerise",
  "carotte",
  "tomate",
  "salade",
  "hamburger",
  "sandwich",
  "croissant",
  "pain",
  "fromage",
  "oeuf",
  "poulet",
  "spaghetti",
  "soupe",
  "cookie",
  "chocolat",
  "bonbon",
  "sucette",
  "pop-corn",
  "frites",
  "hot-dog",

  // Objects
  "maison",
  "voiture",
  "velo",
  "avion",
  "bateau",
  "train",
  "bus",
  "moto",
  "telephone",
  "ordinateur",
  "television",
  "livre",
  "stylo",
  "ciseaux",
  "parapluie",
  "lunettes",
  "montre",
  "cle",
  "lampe",
  "chaise",
  "table",
  "lit",
  "porte",
  "fenetre",
  "escalier",
  "horloge",
  "miroir",
  "guitare",
  "piano",
  "tambour",
  "micro",
  "camera",
  "robot",
  "fusee",
  "helicoptere",

  // Nature
  "arbre",
  "fleur",
  "soleil",
  "lune",
  "etoile",
  "nuage",
  "pluie",
  "neige",
  "montagne",
  "riviere",
  "lac",
  "mer",
  "plage",
  "ile",
  "foret",
  "cactus",
  "arc-en-ciel",
  "eclair",
  "volcan",
  "cascade",

  // Body parts
  "oeil",
  "nez",
  "bouche",
  "oreille",
  "main",
  "pied",
  "coeur",
  "dent",

  // Clothing
  "chapeau",
  "casquette",
  "lunettes",
  "chaussure",
  "botte",
  "gant",
  "echarpe",
  "cravate",
  "couronne",
  "masque",

  // Sports & Games
  "ballon",
  "raquette",
  "velo",
  "skate",
  "ski",
  "surf",
  "tennis",
  "basketball",
  "football",
  "baseball",
  "bowling",
  "echecs",
  "carte",

  // Fantasy
  "dragon",
  "licorne",
  "fantome",
  "vampire",
  "zombie",
  "pirate",
  "ninja",
  "princesse",
  "roi",
  "reine",
  "chateau",
  "epee",
  "bouclier",
  "tresor",

  // Professions
  "docteur",
  "policier",
  "pompier",
  "cuisinier",
  "astronaute",
  "clown",

  // Misc
  "cadeau",
  "ballon",
  "bougie",
  "gateau",
  "drapeau",
  "ancre",
  "boussole",
  "loupe",
  "ampoule",
  "parachute",
  "tente",
  "igloo",
  "toile",
  "pinceau",
]

export function getRandomWord(usedWords: Set<string>): string {
  const available = DRAWABLE_WORDS.filter((w) => !usedWords.has(w))
  if (available.length === 0) {
    return DRAWABLE_WORDS[Math.floor(Math.random() * DRAWABLE_WORDS.length)]
  }
  return available[Math.floor(Math.random() * available.length)]
}

const BANNED_PATTERNS = [
  /n[i1!|]gg?[e3a@]/i,
  /f[a@4]g+[o0]/i,
  /sl[u0]t/i,
  /wh[o0]re/i,
  /b[i1!]tch/i,
  /c[u0]nt/i,
  /d[i1!]ck/i,
  /p[e3]n[i1!]s/i,
  /pute/i,
  /salope/i,
  /merde/i,
  /connard/i,
  /enculer?/i,
  /pd/i,
  /nazi/i,
  /hitler/i,
  /ass+hole/i,
  /fuck/i,
  /shit/i,
]

const BANNED_WORDS = [
  "admin",
  "moderator",
  "mod",
  "staff",
  "system",
  "systeme",
  "drawly",
  "support",
  "help",
  "bot",
  "robot",
]

export function isValidUsername(name: string): { valid: boolean; reason?: string } {
  const trimmed = name.trim()

  if (trimmed.length < 2) {
    return { valid: false, reason: "Pseudo trop court (min 2 caracteres)" }
  }

  if (trimmed.length > 20) {
    return { valid: false, reason: "Pseudo trop long (max 20 caracteres)" }
  }

  // Check for only valid characters
  if (!/^[a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF ]+$/.test(trimmed)) {
    return { valid: false, reason: "Caracteres non autorises" }
  }

  // Check banned patterns
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, reason: "Pseudo inapproprie" }
    }
  }

  // Check banned words
  const lower = trimmed.toLowerCase()
  for (const word of BANNED_WORDS) {
    if (lower === word || lower.includes(word)) {
      return { valid: false, reason: "Ce pseudo est reserve" }
    }
  }

  return { valid: true }
}
