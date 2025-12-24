"use client"

import { ArrowLeft, Pencil, Shield, Eye, Database, Lock, Mail, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "Données collectées",
      content: `Nous collectons les informations suivantes : informations de compte (email, pseudo, avatar) ; données de jeu (scores, historique de parties, dessins) ; données techniques (adresse IP, type de navigateur, appareil) ; cookies essentiels pour le fonctionnement du service.`,
    },
    {
      icon: Eye,
      title: "Utilisation des données",
      content: `Vos données sont utilisées pour : fournir et améliorer le service ; personnaliser votre expérience de jeu ; assurer la sécurité et prévenir la fraude ; vous envoyer des communications importantes ; générer des statistiques anonymisées.`,
    },
    {
      icon: Shield,
      title: "Protection des données",
      content: `Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données : chiffrement SSL/TLS ; stockage sécurisé des mots de passe (hachage) ; accès restreint aux données personnelles ; audits de sécurité réguliers.`,
    },
    {
      icon: Lock,
      title: "Partage des données",
      content: `Nous ne vendons jamais vos données personnelles. Nous pouvons partager des données avec : nos prestataires de services (hébergement, analytics) ; les autorités si requis par la loi ; en cas de fusion ou acquisition de l'entreprise (avec notification préalable).`,
    },
    {
      icon: Mail,
      title: "Communications",
      content: `Nous pouvons vous envoyer : des notifications liées à votre compte ; des mises à jour importantes du service ; des newsletters (si vous y êtes abonné). Vous pouvez vous désabonner à tout moment des communications non essentielles.`,
    },
    {
      icon: Trash2,
      title: "Vos droits",
      content: `Conformément au RGPD, vous avez le droit de : accéder à vos données personnelles ; rectifier vos informations ; supprimer votre compte et vos données ; exporter vos données ; vous opposer au traitement de vos données. Contactez-nous pour exercer ces droits.`,
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
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-full mb-6 border border-emerald-500/20">
            <Shield className="w-4 h-4" />
            Politique de confidentialité
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Vie{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              privée
            </span>
          </h1>
          <p className="text-lg text-white/50">
            Nous respectons votre vie privée. Voici comment nous traitons vos données.
          </p>
        </div>

        {/* Key points */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="glass rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-white">Données sécurisées</p>
            <p className="text-xs text-white/50 mt-1">Chiffrement SSL/TLS</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-cyan-400" />
            </div>
            <p className="text-sm font-medium text-white">Pas de vente</p>
            <p className="text-xs text-white/50 mt-1">Vos données ne sont jamais vendues</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-white">Droit à l'oubli</p>
            <p className="text-xs text-white/50 mt-1">Supprimez vos données à tout moment</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-white">{section.title}</h2>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Cookies */}
        <div className="mt-8 glass rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">Cookies</h2>
          <div className="space-y-4 text-sm text-white/60">
            <p>Nous utilisons des cookies pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintenir votre session de connexion</li>
              <li>Mémoriser vos préférences de jeu</li>
              <li>Analyser l'utilisation du service (analytics anonymisés)</li>
            </ul>
            <p className="mt-4">
              Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais certaines fonctionnalités
              pourraient ne plus fonctionner correctement.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 glass rounded-xl p-6 border border-primary/20">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-primary shrink-0" />
            <div>
              <h4 className="font-bold text-white mb-1">Questions ?</h4>
              <p className="text-sm text-white/60">
                Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits, contactez
                notre DPO à privacy@drawly.app ou via notre serveur Discord.
              </p>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="text-center mt-12">
          <p className="text-sm text-white/30">Dernière mise à jour : 24 décembre 2024</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
