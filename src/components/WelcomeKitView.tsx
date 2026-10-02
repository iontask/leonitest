import React, { useState } from 'react';
import { Candidate, WelcomeKit } from '../types';
import {
  PackageCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  FileCheck,
  User,
  Key,
  Shirt,
  Sparkles,
  HardHat,
  BookOpen,
} from 'lucide-react';

interface WelcomeKitViewProps {
  candidates: Candidate[];
  onUpdateWelcomeKit: (candidateId: number, kit: Partial<WelcomeKit>) => void;
}

export const WelcomeKitView: React.FC<WelcomeKitViewProps> = ({
  candidates,
  onUpdateWelcomeKit,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    candidates[0]?.id || 1
  );

  const candidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  const kit = candidate?.welcomeKit || {
    id: 1,
    candidateId: selectedCandidateId,
    vestGiven: false,
    blouseGiven: false,
    contractGiven: false,
    badgeGiven: false,
    lockerGiven: false,
    bookletGiven: false,
    ppeGiven: false,
  };

  const calculateKitPercentage = (k: WelcomeKit) => {
    let count = 0;
    if (k.vestGiven) count++;
    if (k.blouseGiven) count++;
    if (k.contractGiven) count++;
    if (k.badgeGiven) count++;
    if (k.lockerGiven) count++;
    if (k.bookletGiven) count++;
    if (k.ppeGiven) count++;
    return Math.round((count / 7) * 100);
  };

  const handleToggle = (key: keyof WelcomeKit) => {
    if (!candidate) return;
    const currentVal = !!kit[key];
    onUpdateWelcomeKit(candidate.id, {
      [key]: !currentVal,
      responsibleName: 'Nadia El Fassi (RH Onboarding)',
      signedAt: kit.signedAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
  };

  const handleDigitalSign = () => {
    if (!candidate) return;
    onUpdateWelcomeKit(candidate.id, {
      signedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      signatureDataUrl: 'SIGNATURE_DIGITALE_VALIDEE',
      responsibleName: 'Nadia El Fassi (RH Onboarding)',
    });
  };

  const kitPercent = calculateKitPercentage(kit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Module 2 — Accueil (J1) & Welcome Kit</h1>
          <p className="text-xs text-slate-500">
            Remise horodatée des dotations obligatoires J1, signature numérique et calcul du Readiness Score.
          </p>
        </div>

        {/* Global readiness stat */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <PackageCheck className="w-6 h-6 text-indigo-600" />
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Readiness Score Usine</div>
            <div className="text-base font-extrabold text-slate-900">94.8% d équipement J1</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Selector List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recrues en cours d accueil ({candidates.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {candidates.map((c) => {
              const currentKit = c.welcomeKit || ({} as WelcomeKit);
              const p = calculateKitPercentage(currentKit as WelcomeKit);
              const isSelected = c.id === selectedCandidateId;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`p-3 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{c.cin}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        p === 100
                          ? 'bg-emerald-100 text-emerald-800'
                          : p > 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p}% complet
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {currentKit.signedAt ? 'Signé J1' : 'En attente signature'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Interactive Checklist for Selected Candidate */}
        {candidate && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
              {/* Candidate Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {candidate.firstName} {candidate.lastName}
                    </h2>
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {candidate.cin}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Affectation : {candidate.productionAssignment?.line || 'École de formation'} • Entrée le {candidate.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Complétude Welcome Kit</span>
                    <span className="text-xl font-black text-indigo-600">{kitPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Dotation Checklist */}
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-800 block text-sm">
                  Checklist des Dotations Métier J1 (Obligatoires)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Veste */}
                  <div
                    onClick={() => handleToggle('vestGiven')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      kit.vestGiven
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shirt className={`w-4 h-4 ${kit.vestGiven ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-semibold block">Veste de Travail Usine</span>
                        <span className="text-[10px] text-slate-500">Taille réglementaire</span>
                      </div>
                    </div>
                    {kit.vestGiven ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>

                  {/* Blouse */}
                  <div
                    onClick={() => handleToggle('blouseGiven')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      kit.blouseGiven
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shirt className={`w-4 h-4 ${kit.blouseGiven ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-semibold block">Blouse Antistatique (ESD)</span>
                        <span className="text-[10px] text-slate-500">Protection connectique</span>
                      </div>
                    </div>
                    {kit.blouseGiven ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>

                  {/* Contrat de travail */}
                  <div
                    onClick={() => handleToggle('contractGiven')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      kit.contractGiven
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className={`w-4 h-4 ${kit.contractGiven ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-semibold block">Contrat de Travail J1</span>
                        <span className="text-[10px] text-slate-500">Signé et paraphé</span>
                      </div>
                    </div>
                    {kit.contractGiven ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>

                  {/* Badge RFID */}
                  <div
                    onClick={() => handleToggle('badgeGiven')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      kit.badgeGiven
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className={`w-4 h-4 ${kit.badgeGiven ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-semibold block">Badge d Accès RFID Usine</span>
                        <span className="text-[10px] text-slate-500">Tourniquet & réfectoire</span>
                      </div>
                    </div>
                    {kit.badgeGiven ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>

                  {/* Casier */}
                  <div
                    onClick={() => handleToggle('lockerGiven')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      kit.lockerGiven
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50/70 border-rose-300 text-rose-950 hover:bg-rose-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Key className={`w-4 h-4 ${kit.lockerGiven ? 'text-emerald-600' : 'text-rose-500'}`} />
                      <div>
                        <span className="font-semibold block">Casier Vestiaire Attribué</span>
                        <span className="text-[10px] text-slate-500">Clé & cadenas remis</span>
                      </div>
                    </div>
                    {kit.lockerGiven ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>

                  {/* Livret d'accueil */}
                  <div
                    onClick={() => handleToggle('bookletGiven')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      kit.bookletGiven
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className={`w-4 h-4 ${kit.bookletGiven ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-semibold block">Livret d Accueil Digital</span>
                        <span className="text-[10px] text-slate-500">Règlement intérieur & sécurité</span>
                      </div>
                    </div>
                    {kit.bookletGiven ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>

                  {/* EPI */}
                  <div
                    onClick={() => handleToggle('ppeGiven')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all sm:col-span-2 ${
                      kit.ppeGiven
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50/70 border-rose-300 text-rose-950 hover:bg-rose-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <HardHat className={`w-4 h-4 ${kit.ppeGiven ? 'text-emerald-600' : 'text-rose-500'}`} />
                      <div>
                        <span className="font-semibold block">Pack EPI Complet</span>
                        <span className="text-[10px] text-slate-500">
                          Chaussures S3 embout acier, lunettes de protection, bouchons antibruit & gants anti-coupure
                        </span>
                      </div>
                    </div>
                    {kit.ppeGiven ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Digital Signature & Responsible Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500" />
                    Responsable RH d Accueil : {kit.responsibleName || 'Nadia El Fassi (RH)'}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Horodatage de remise : {kit.signedAt || 'Non validé à ce jour'}
                  </div>
                </div>

                <div>
                  {kit.signedAt ? (
                    <div className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Émargement Numérique Validé
                    </div>
                  ) : (
                    <button
                      id="btn-sign-welcome-kit"
                      onClick={handleDigitalSign}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Valider la Signature de Réception J1
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
