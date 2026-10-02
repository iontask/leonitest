import React, { useState } from 'react';
import { Candidate, CandidateStatus, TrainingSession } from '../types';
import {
  Search,
  UserPlus,
  Filter,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Phone,
  MapPin,
  Award,
  GraduationCap,
} from 'lucide-react';

interface CandidatesViewProps {
  candidates: Candidate[];
  trainingSessions: TrainingSession[];
  onSelectCandidate: (candidateId: number) => void;
  onAddCandidate: (data: Partial<Candidate>) => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  candidates,
  trainingSessions,
  onSelectCandidate,
  onAddCandidate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Candidate Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newCin, setNewCin] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newEducation, setNewEducation] = useState('Bac+2 Technicien Câblage');
  const [newTestScore, setNewTestScore] = useState<number>(85);
  const [newSessionId, setNewSessionId] = useState<number>(1);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [diplomaFileName, setDiplomaFileName] = useState<string | null>(null);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newCin) return;

    onAddCandidate({
      firstName: newFirstName,
      lastName: newLastName,
      cin: newCin,
      phone: newPhone || '+212 6 00 00 00 00',
      address: newAddress || 'Tanger',
      educationLevel: newEducation,
      testScore: Number(newTestScore),
      status: 'SELECTED',
      trainingSessionId: Number(newSessionId),
      cvUrl: cvFileName || 'cv_uploaded.pdf',
      diplomaScanUrl: diplomaFileName || 'diplome_scan.pdf',
    });

    // Reset
    setNewFirstName('');
    setNewLastName('');
    setNewCin('');
    setNewPhone('');
    setNewAddress('');
    setCvFileName(null);
    setDiplomaFileName(null);
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: CandidateStatus) => {
    switch (status) {
      case 'IN_PRODUCTION':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">En Production</span>;
      case 'IN_TRAINING':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">École (5j)</span>;
      case 'SELECTED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Sélectionné (J1)</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">En attente</span>;
      case 'DEPARTED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Désisté</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">Non retenu</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Module 1 — Candidats & Présélection</h1>
          <p className="text-xs text-slate-500">
            Gestion des nouvelles recrues, tests d entrée digitaux, scan CV/diplôme et affectation aux sessions écoles.
          </p>
        </div>

        <button
          id="btn-add-candidate"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nouveau Candidat</span>
        </button>
      </div>

      {/* KPI Cards for Module 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Candidats</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{candidates.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% numérisés</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Taux Sélection</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">78.4%</div>
          <span className="text-[11px] text-slate-500">Tests techniques</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Présence Démarrage</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">96.2%</div>
          <span className="text-[11px] text-slate-500">J1 à l usine</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Désistement Pré-J1</span>
          <div className="text-2xl font-bold text-slate-700 mt-1">3.8%</div>
          <span className="text-[11px] text-slate-400">Objectif &lt; 5%</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou CIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">Tous les statuts ({candidates.length})</option>
            <option value="IN_PRODUCTION">En Production</option>
            <option value="IN_TRAINING">École (5j)</option>
            <option value="SELECTED">Sélectionnés (J1)</option>
            <option value="PENDING">En attente</option>
          </select>
        </div>
      </div>

      {/* Candidate Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Recrue</th>
                <th className="py-3 px-4">CIN / Contact</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Formation & Test</th>
                <th className="py-3 px-4">Documents</th>
                <th className="py-3 px-4">Jalon</th>
                <th className="py-3 px-4 text-right">Fiche 90j</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCandidate(c.id)}
                  className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {c.address}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-xs font-semibold text-slate-800">{c.cin}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(c.status)}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{c.educationLevel || 'Non renseigné'}</div>
                    <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                      <Award className="w-3 h-3" /> Score Test : {c.testScore ?? 80}/100
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-max">
                      <CheckCircle2 className="w-3 h-3" /> CV + Diplôme OK
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-700">Jour {c.dayInJourney}/90</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Candidate & Digital Test */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Créer une Nouvelle Recrue (Module 1)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Ex: Bilal"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Ex: El Amrani"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CIN (Identifiant Unique) *</label>
                  <input
                    type="text"
                    required
                    value={newCin}
                    onChange={(e) => setNewCin(e.target.value)}
                    placeholder="Ex: K998811"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs uppercase font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+212 6..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse de Résidence</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ex: Quartier Drissia, Tanger"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Niveau d Études</label>
                  <select
                    value={newEducation}
                    onChange={(e) => setNewEducation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="CQP Câblage Automobile">CQP Câblage Automobile</option>
                    <option value="Bac+2 Technicien Spécialisé">Bac+2 Technicien Spécialisé</option>
                    <option value="Baccalauréat Technique">Baccalauréat Technique</option>
                    <option value="Formation Qualifiante Métiers">Formation Qualifiante</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Score Test d Entrée (/100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTestScore}
                    onChange={(e) => setNewTestScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affectation Session École</label>
                <select
                  value={newSessionId}
                  onChange={(e) => setNewSessionId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {trainingSessions.map((ts) => (
                    <option key={ts.id} value={ts.id}>
                      {ts.cohortName} ({ts.startDate} au {ts.endDate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Uploads */}
              <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                <span className="block font-semibold text-slate-700">Pièces Justificatives Numérisées</span>
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{cvFileName || 'Charger CV (PDF/Scan)'}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setCvFileName(e.target.files?.[0]?.name || 'cv_candidat.pdf')}
                    />
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{diplomaFileName || 'Charger Diplôme'}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setDiplomaFileName(e.target.files?.[0]?.name || 'diplome_scan.pdf')}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Enregistrer et Initialiser J1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
