import Link from "next/link"
import { ArrowLeft, Database, CheckCircle, AlertTriangle } from "lucide-react"

export default function SetupPage() {
  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818]" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="glass-strong rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Configuration Supabase</h1>
              <p className="text-sm text-white/50">Guide d'installation pour les administrateurs</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Creer le bucket avatars
              </h3>
              <ol className="text-sm text-white/70 space-y-2 ml-8 list-decimal">
                <li>Allez dans votre dashboard Supabase</li>
                <li>
                  Naviguez vers <strong>Storage</strong> dans le menu lateral
                </li>
                <li>
                  Cliquez sur <strong>New bucket</strong>
                </li>
                <li>
                  Nommez-le <code className="px-1.5 py-0.5 bg-white/10 rounded text-cyan-400">avatars</code>
                </li>
                <li>
                  Cochez <strong>Public bucket</strong>
                </li>
                <li>
                  Cliquez sur <strong>Create bucket</strong>
                </li>
              </ol>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Configurer les policies RLS
              </h3>
              <p className="text-sm text-white/70 mb-3 ml-8">
                Dans l'onglet <strong>Policies</strong> du bucket avatars, ajoutez ces policies :
              </p>

              <div className="space-y-3 ml-8">
                <div className="p-3 bg-black/30 rounded-lg">
                  <p className="text-xs text-emerald-400 mb-1">SELECT - Lecture publique</p>
                  <code className="text-xs text-white/80 font-mono">true</code>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <p className="text-xs text-cyan-400 mb-1">INSERT - Upload par l'utilisateur</p>
                  <code className="text-xs text-white/80 font-mono block whitespace-pre-wrap">
                    {`(bucket_id = 'avatars') AND ((storage.foldername(name))[1] = (auth.uid())::text)`}
                  </code>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <p className="text-xs text-amber-400 mb-1">UPDATE - Mise a jour par l'utilisateur</p>
                  <code className="text-xs text-white/80 font-mono block whitespace-pre-wrap">
                    {`(bucket_id = 'avatars') AND ((storage.foldername(name))[1] = (auth.uid())::text)`}
                  </code>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <p className="text-xs text-red-400 mb-1">DELETE - Suppression par l'utilisateur</p>
                  <code className="text-xs text-white/80 font-mono block whitespace-pre-wrap">
                    {`(bucket_id = 'avatars') AND ((storage.foldername(name))[1] = (auth.uid())::text)`}
                  </code>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Variables d'environnement
              </h3>
              <p className="text-sm text-white/70 mb-3 ml-8">Assurez-vous que ces variables sont configurees :</p>
              <div className="ml-8 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <code className="text-xs text-white/80">NEXT_PUBLIC_SUPABASE_URL</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <code className="text-xs text-white/80">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <code className="text-xs text-white/80">SIGHTENGINE_API_USER</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <code className="text-xs text-white/80">SIGHTENGINE_API_SECRET</code>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-400 mb-1">Important</h4>
                  <p className="text-sm text-amber-400/80">
                    Les migrations SQL pour storage.objects ne peuvent pas etre executees via l'API. Vous devez
                    configurer le bucket et les policies manuellement dans le dashboard Supabase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
