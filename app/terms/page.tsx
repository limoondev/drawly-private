"use client"

import { ArrowLeft, Pencil, Scale, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptation des conditions",
      content: `En accédant à Drawly ou en l'utilisant, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service. Nous nous réservons le droit de modifier ces conditions à tout moment, et votre utilisation continue du service constitue votre acceptation de ces modifications.`,
    },
    {
      title: "2. Description du service",
      content: `Drawly est un jeu de dessin multijoueur en ligne gratuit. Les utilisateurs peuvent créer ou rejoindre des parties, dessiner des mots attribués et deviner les dessins des autres joueurs. Le service est fourni "tel quel" sans garantie d'aucune sorte.`,
    },
    {
      title: "3. Compte utilisateur",
      content: `Pour accéder à certaines fonctionnalités, vous devrez peut-être créer un compte. Vous êtes responsable de maintenir la confidentialité de votre compte et mot de passe. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte.`,
    },
    {
      title: "4. Règles de conduite",
      content: `En utilisant Drawly, vous vous engagez à ne pas : publier de contenu offensant, inapproprié ou illégal ; harceler ou intimider d'autres utilisateurs ; tricher ou utiliser des outils externes pour obtenir un avantage déloyal ; tenter de perturber le fonctionnement du service ; usurper l'identité d'une autre personne.`,
    },
    {
      title: "5. Contenu utilisateur",
      content: `Les dessins et messages créés sur Drawly restent votre propriété. Cependant, en les publiant, vous nous accordez une licence non exclusive pour les utiliser, les afficher et les distribuer dans le cadre du service. Nous nous réservons le droit de supprimer tout contenu qui viole nos conditions.`,
    },
    {
      title: "6. Modération et sanctions",
      content: `Notre équipe de modération peut prendre des mesures contre les utilisateurs qui violent nos conditions, incluant : avertissements, suspension temporaire ou bannissement permanent. Les décisions de modération sont prises à notre seule discrétion et peuvent être contestées via notre support.`,
    },
    {
      title: "7. Propriété intellectuelle",
      content: `Drawly et tout son contenu original (logo, design, code) sont protégés par le droit d'auteur. Vous ne pouvez pas copier, modifier ou distribuer notre contenu sans autorisation écrite préalable.`,
    },
    {
      title: "8. Limitation de responsabilité",
      content: `Drawly n'est pas responsable des dommages directs, indirects, accessoires ou consécutifs résultant de votre utilisation du service. Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs.`,
    },
    {
      title: "9. Modifications du service",
      content: `Nous nous réservons le droit de modifier, suspendre ou interrompre tout aspect du service à tout moment, avec ou sans préavis. Nous ne serons pas responsables envers vous ou tout tiers pour toute modification, suspension ou interruption du service.`,
    },
    {
      title: "10. Contact",
      content: `Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter via notre serveur Discord ou par email à support@drawly.app.`,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818] flex flex-col">
      {/* Header */}
      <header className="glass-strong border-b border-white/5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-lg flex items-center justify-center">
              <Pencil className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Drawly</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/10 px-4 py-2 rounded-full mb-6 border border-purple-500/20">
            <Scale className="w-4 h-4" />
            Conditions d'utilisation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Conditions{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              d'utilisation
            </span>
          </h1>
          <p className="text-lg text-white/50">Dernière mise à jour : 24 décembre 2024</p>
        </div>

        {/* Important notice */}
        <div className="glass rounded-xl p-6 border border-amber-500/20 bg-amber-500/5 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white mb-1">Important</h4>
              <p className="text-sm text-white/60">
                En utilisant Drawly, vous acceptez automatiquement ces conditions d'utilisation. Veuillez les lire
                attentivement avant de continuer.
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-white">{section.title}</h2>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Acceptance */}
        <div className="mt-8 glass rounded-xl p-6 border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white mb-1">Votre acceptation</h4>
              <p className="text-sm text-white/60">
                En continuant à utiliser Drawly, vous confirmez avoir lu, compris et accepté ces conditions
                d'utilisation dans leur intégralité.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
