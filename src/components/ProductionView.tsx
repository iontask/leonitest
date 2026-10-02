import React, { useState } from 'react';
import { Candidate, ProductionAssignment } from '../types';
import {
  Briefcase,
  AlertOctagon,
  Users,
  Layers,
  Clock,
  ShieldCheck,
  CheckCircle2,
  GitFork,
} from 'lucide-react';

interface ProductionViewProps {
  candidates: Candidate[];
  onUpdateProduction: (candidateId: number, data: Partial<ProductionAssignment>) => void;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  candidates,
  onUpdateProduction,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    candidates.find((c) => c.status === 'IN_PRODUCTION')?.id || candidates[0]?.id || 1
  );

  const candidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  const prod = candidate?.productionAssignment;

  // Form states
  const [segment, setSegment] = useState(prod?.segment || 'Segment Câblage Moteur');
  const [line, setLine] = useState(prod?.line || 'Ligne CM-01');
  const [shift, setShift] = useState(prod?.shift || 'Shift A (Matin)');
  const [position, setPosition] = useState(prod?.position || 'Sertissage et Encliquetage Bornier');
  const [jobFamily, setJobFamily] = useState(prod?.jobFamily || 'Opérateur Câblage');
  const [positionType, setPositionType] = useState(prod?.positionType || 'moyen');
  const [isCritical, setIsCritical] = useState(prod?.isCritical || false);
  const [isBottleneck, setIsBottleneck] = useState(prod?.isBottleneck || false);
  const [trainerName, setTrainerName] = useState(prod?.trainerName || 'Omar Radi');
  const [teamSpeakerName, setTeamSpeakerName] = useState(prod?.teamSpeakerName || 'Hamza Tahiri');
  const [hanchoName, setHanchoName] = useState(prod?.hanchoName || 'Rachid Mansouri');
  const [shiftLeaderName, setShiftLeaderName] = useState(prod?.shiftLeaderName || 'Karim Boukhal');
  const [segmentLeaderName, setSegmentLeaderName] = useState(prod?.segmentLeaderName || 'Mustapha El Idrissi');

  const handleSelectCandidate = (c: Candidate) => {
    setSelectedCandidateId(c.id);
    const p = c.productionAssignment;
    setSegment(p?.segment || 'Segment Câblage Moteur');
    setLine(p?.line || 'Ligne CM-01');
    setShift(p?.shift || 'Shift A (Matin)');
    setPosition(p?.position || 'Opérateur Polyvalent');
    setJobFamily(p?.jobFamily || 'Opérateur Câblage');
    setPositionType(p?.positionType || 'moyen');
    setIsCritical(p?.isCritical || false);
    setIsBottleneck(p?.isBottleneck || false);
    setTrainerName(p?.trainerName || 'Omar Radi');
    setTeamSpeakerName(p?.teamSpeakerName || 'Hamza Tahiri');
    setHanchoName(p?.hanchoName || 'Rachid Mansouri');
    setShiftLeaderName(p?.shiftLeaderName || 'Karim Boukhal');
    setSegmentLeaderName(p?.segmentLeaderName || 'Mustapha El Idrissi');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    onUpdateProduction(candidate.id, {
      segment,
      line,
      shift,
      position,
      jobFamily,
      positionType: positionType as 'simple' | 'moyen' | 'complexe',
      isCritical,
      isBottleneck,
      trainerName,
      teamSpeakerName,
      hanchoName,
      shiftLeaderName,
      segmentLeaderName,
    });
  };

  const criticalPostsCount = candidates.filter(
    (c) => c.productionAssignment?.isCritical
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Module 6 — Affectation Production & Hiérarchie</h1>
          <p className="text-xs text-slate-500">
            Affectation segment, ligne, shift, poste de travail et chaîne managériale (Hancho, Team Speaker, Shift Leader).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-semibold">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>3 Segments de Production • 8 Lignes Actives</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Opérateurs en Production ({candidates.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {candidates.map((c) => {
              const isSelected = c.id === selectedCandidateId;
              const p = c.productionAssignment;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCandidate(c)}
                  className={`p-3 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {p?.line || 'Non encore affecté'} • {p?.shift || 'En attente'}
                    </div>
                  </div>

                  <div className="text-right">
                    {p?.isCritical && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 block mb-1">
                        Poste Critique
                      </span>
                    )}
                    {p?.isBottleneck && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 block">
                        Goulot
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Candidate Production Config Form */}
        {candidate && (
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {candidate.firstName} {candidate.lastName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    CIN : {candidate.cin} • Jalon Jour {candidate.dayInJourney}/90
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Enregistrer l Affectation
                </button>
              </div>

              {/* Segment & Line */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Segment Manufacturing</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Segment Câblage Moteur">Segment Câblage Moteur</option>
                    <option value="Segment Cockpit & Planche de Bord">Segment Cockpit & Planche de Bord</option>
                    <option value="Segment Finition & Contrôle">Segment Finition & Contrôle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ligne de Production</label>
                  <select
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Ligne CM-01">Ligne CM-01 (Moteur standard)</option>
                    <option value="Ligne CM-02 (Haute Cadence)">Ligne CM-02 (Haute Cadence)</option>
                    <option value="Ligne CK-01 (Poste Critique Goulot)">Ligne CK-01 (Cockpit)</option>
                    <option value="Ligne FC-03">Ligne FC-03 (Finition)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift de Travail</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Shift A (Matin)">Shift A (Matin - 06:00 / 14:00)</option>
                    <option value="Shift B (Après-midi)">Shift B (Après-midi - 14:00 / 22:00)</option>
                    <option value="Shift C (Nuit)">Shift C (Nuit - 22:00 / 06:00)</option>
                  </select>
                </div>
              </div>

              {/* Station Details & Criticality Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Poste de Travail Dédié</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Complexité du Poste</label>
                  <select
                    value={positionType}
                    onChange={(e) => setPositionType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="simple">Simple (Apprentissage rapide)</option>
                    <option value="moyen">Moyen (Standards courants)</option>
                    <option value="complexe">Complexe (Haute technicité/Takt court)</option>
                  </select>
                </div>
              </div>

              {/* Flags */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCritical}
                    onChange={(e) => setIsCritical(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Poste Critique Qualité / Sécurité
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBottleneck}
                    onChange={(e) => setIsBottleneck(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5 text-amber-600" /> Poste Goulot d Étranglement de la Ligne
                  </span>
                </label>
              </div>

              {/* Management Hierarchy Assignment */}
              <div className="space-y-3 text-xs pt-4 border-t border-slate-200">
                <span className="font-bold text-slate-800 block text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" /> Chaîne d Encadrement Managérial
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Hancho (Chef de Ligne)</label>
                    <input
                      type="text"
                      value={hanchoName}
                      onChange={(e) => setHanchoName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Team Speaker (Animation)</label>
                    <input
                      type="text"
                      value={teamSpeakerName}
                      onChange={(e) => setTeamSpeakerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Shift Leader</label>
                    <input
                      type="text"
                      value={shiftLeaderName}
                      onChange={(e) => setShiftLeaderName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
