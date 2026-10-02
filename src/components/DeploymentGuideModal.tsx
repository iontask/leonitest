import React, { useState } from 'react';
import {
  X,
  Github,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Settings,
  Sparkles,
  Key,
  RotateCcw,
} from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
  onResetData,
}) => {
  const [apiKey, setApiKey] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('gemini_api_key')) || '';
  });
  const [keySaved, setKeySaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    if (typeof window !== 'undefined') {
      if (apiKey.trim()) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
      } else {
        localStorage.removeItem('gemini_api_key');
      }
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Déploiement GitHub Actions & GitHub Pages</h3>
              <p className="text-[11px] text-slate-300">
                Configuration automatisée et hébergement statique haute performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Status Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 text-sm">
                Configuration GitHub Actions prête à l emploi !
              </p>
              <p className="text-emerald-700 mt-0.5">
                Le workflow <code className="px-1.5 py-0.5 bg-emerald-100 rounded text-emerald-800 font-mono text-[11px]">.github/workflows/deploy.yml</code> a été généré avec support complet des sous-chemins, SPA routing et persistance locale.
              </p>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-indigo-600" /> 3 Étapes pour activer votre déploiement :
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">Activer GitHub Actions dans GitHub Pages</p>
                  <p className="text-slate-600">
                    Rendez-vous sur votre dépôt GitHub : <strong>Settings</strong> &gt; <strong>Pages</strong>.
                    Sous <strong>Build and deployment &gt; Source</strong>, sélectionnez <span className="font-semibold text-indigo-600">GitHub Actions</span> (au lieu de Deploy from a branch).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">Pousser votre code sur la branche principale</p>
                  <p className="text-slate-600">
                    Dans votre terminal, validez et poussez les modifications :
                  </p>
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto mt-1 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>git add . && git commit -m &quot;Deploy to GitHub Pages&quot; && git push origin main</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">Suivre le déploiement automatique</p>
                  <p className="text-slate-600">
                    Ouvrez l onglet <strong>Actions</strong> sur GitHub. Le workflow construit automatiquement l application et la publie sur :
                  </p>
                  <p className="font-mono text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-200 mt-1">
                    https://&lt;votre-pseudo&gt;.github.io/&lt;nom-du-repo&gt;/
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Gemini API Key for direct browser access on Pages */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              <h5 className="font-bold text-slate-900">Optionnel : Clé API Gemini directe (pour GitHub Pages)</h5>
            </div>
            <p className="text-slate-600 text-[11px]">
              Sur GitHub Pages, l application fonctionne de manière 100% autonome avec son moteur d analyse Lean intégré. Vous pouvez également connecter votre propre clé Google AI Studio pour des réponses Gemini personnalisées :
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ex: AIzaSy..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                {keySaved ? 'Enregistrée !' : 'Enregistrer'}
              </button>
            </div>
          </div>

          {/* Reset Local Demo Data */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Réinitialiser les données de démonstration</p>
              <p className="text-[11px] text-slate-500">
                Efface le stockage local et recharge les 8 recrues industrielles de référence.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Voulez-vous réinitialiser toutes les données locales aux valeurs initiales ?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
