import React, { useState } from 'react';
import { Candidate, TransportAssignment, TransportIncident } from '../types';
import {
  Bus,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Route,
  Navigation as NavigationIcon,
} from 'lucide-react';

interface TransportViewProps {
  candidates: Candidate[];
  onUpdateTransport: (candidateId: number, transport: Partial<TransportAssignment>) => void;
  onAddIncident: (candidateId: number, incident: Partial<TransportIncident>) => void;
}

export const TransportView: React.FC<TransportViewProps> = ({
  candidates,
  onUpdateTransport,
  onAddIncident,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    candidates[0]?.id || 1
  );
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentType, setIncidentType] = useState<'retard' | 'absence'>('retard');
  const [incidentNotes, setIncidentNotes] = useState('');

  const candidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  const transport = candidate?.transport;

  const handleConfirmJMinus1 = () => {
    if (!candidate) return;
    onUpdateTransport(candidate.id, {
      confirmed: true,
      validatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    onAddIncident(candidate.id, {
      type: incidentType,
      date: new Date().toISOString().slice(0, 10),
      notes: incidentNotes || `Incident de transport (${incidentType})`,
    });

    setIncidentNotes('');
    setIsIncidentModalOpen(false);
  };

  const confirmedJ1Count = candidates.filter((c) => c.transport?.confirmed).length;
  const totalIncidents = candidates.reduce(
    (acc, c) => acc + (c.transport?.incidents?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Module 3 — Transport & Navettes Usine</h1>
          <p className="text-xs text-slate-500">
            Attribution des lignes de ramassage, validation logistique J-1 et suivi des retards/absences transport.
          </p>
        </div>

        <button
          onClick={() => setIsIncidentModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Signaler un Incident Navette</span>
        </button>
      </div>

      {/* KPI Cards for Transport */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Validations J-1</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {Math.round((confirmedJ1Count / Math.max(candidates.length, 1)) * 100)}%
          </div>
          <span className="text-[11px] text-slate-400">{confirmedJ1Count}/{candidates.length} confirmés</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Arrivée à l Heure J1</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">98.1%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Ponctualité shifts</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Incidents Recensés</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{totalIncidents}</div>
          <span className="text-[11px] text-slate-400">Pannes ou retards trafic</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Temps Trajet Moyen</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">26 min</div>
          <span className="text-[11px] text-slate-400">Rayon 15 km usine</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recrues List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Lignes de Ramassage par Recrue
            </h2>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {candidates.map((c) => {
              const tr = c.transport;
              const isSelected = c.id === selectedCandidateId;
              const hasIncidents = (tr?.incidents?.length || 0) > 0;

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
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Bus className="w-3 h-3 text-slate-400" />
                      {tr?.lineName || 'Non assigné'}
                    </div>
                  </div>

                  <div className="text-right">
                    {tr?.confirmed ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Confirmé J-1
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        En attente J-1
                      </span>
                    )}

                    {hasIncidents && (
                      <div className="text-[10px] text-rose-600 font-bold mt-1">
                        {tr?.incidents.length} incident(s)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transport Detail Card */}
        {candidate && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {candidate.firstName} {candidate.lastName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Adresse déclarée : {candidate.address}
                  </p>
                </div>

                <div>
                  {transport?.confirmed ? (
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Navette Validée J-1 ({transport.validatedAt})
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirmJMinus1}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Valider l Attribution J-1
                    </button>
                  )}
                </div>
              </div>

              {/* Route & Schedule Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                    <Route className="w-4 h-4 text-indigo-600" /> Ligne & Arrêt de Ramassage
                  </span>
                  <div className="text-sm font-semibold text-slate-900">
                    {transport?.lineName || 'Ligne non spécifiée'}
                  </div>
                  <div className="text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Point :{' '}
                    <strong className="text-slate-800">{transport?.pickupPoint || 'Arrêt principal'}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" /> Horaires & Trajet
                  </span>
                  <div className="text-sm font-semibold text-slate-900">
                    Départ : {transport?.schedule || '06:15 Shift A'}
                  </div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <span>Distance : <strong>{transport?.distanceKm || 12} km</strong></span>
                    <span>•</span>
                    <span>Durée estimée : <strong>{transport?.travelTimeMin || 25} min</strong></span>
                  </div>
                </div>
              </div>

              {/* Incidents Log */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">
                    Historique des Incidents Navette ({transport?.incidents?.length || 0})
                  </span>
                </div>

                {(!transport?.incidents || transport.incidents.length === 0) ? (
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Aucun incident de transport répertorié. Ponctualité exemplaire.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transport.incidents.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-900 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            {inc.type === 'retard' ? 'Retard de Navette' : 'Absence liée au transport'}
                          </div>
                          <div className="text-[11px] text-rose-700">{inc.notes}</div>
                        </div>
                        <span className="text-[11px] font-mono text-rose-600">{inc.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Report Incident */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Déclarer un Incident Navette
              </h3>
              <button
                onClick={() => setIsIncidentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recrue concernée</label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.transport?.lineName || 'Navette'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type d anomalie</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as 'retard' | 'absence')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="retard">Retard de la navette de ramassage</option>
                  <option value="absence">Absence causée par un défaut de transport</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Détails / Motif</label>
                <textarea
                  required
                  rows={3}
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                  placeholder="Ex: Panne mécanique de la navette sur l'axe sud, retard de 25 min..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
                >
                  Enregistrer l Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
