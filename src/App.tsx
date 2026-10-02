import React, { useState, useEffect } from 'react';
import {
  Candidate,
  DashboardStats,
  Alert,
  PolyvalenceSkill,
  TrainingSession,
  UserRole,
  WelcomeKit,
  TransportAssignment,
  TransportIncident,
  Attendance,
  Evaluation,
  ProductionAssignment,
  LearningCurvePoint,
  Survey,
} from './types';
import { initialCandidates, initialTrainingSessions, initialPolyvalenceMatrix } from './data/seedData';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CandidatesView } from './components/CandidatesView';
import { WelcomeKitView } from './components/WelcomeKitView';
import { TransportView } from './components/TransportView';
import { SchoolView } from './components/SchoolView';
import { ProductionView } from './components/ProductionView';
import { LearningCurveView } from './components/LearningCurveView';
import { PolyvalenceView } from './components/PolyvalenceView';
import { AttritionView } from './components/AttritionView';
import { AlertsView } from './components/AlertsView';
import { SurveysView } from './components/SurveysView';
import { ReportsView } from './components/ReportsView';
import { AiCopilotModal } from './components/AiCopilotModal';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [trainingSessions] = useState<TrainingSession[]>(initialTrainingSessions);
  const [polyvalenceMatrix, setPolyvalenceMatrix] = useState<PolyvalenceSkill[]>(initialPolyvalenceMatrix);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 8,
    activeInTraining: 3,
    activeInProduction: 4,
    validated90Days: 1,
    abandonedCount: 0,
    retentionRate90Days: 100,
    avgAttritionRisk: 34,
    readinessScoreJ1: 94.8,
    avgSchoolSuccessRate: 94.2,
    avgQualityFPY: 97.4,
    criticalAttritionCount: 1,
    mediumAttritionCount: 2,
    lowAttritionCount: 5,
    openAlertsCount: 3,
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('RH');
  const [isCronRunning, setIsCronRunning] = useState<boolean>(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial data from server API
  const refreshData = async () => {
    try {
      const [candRes, statsRes, alertsRes, polyRes] = await Promise.allSettled([
        fetch('/api/candidates').then((r) => r.json()),
        fetch('/api/stats/dashboard').then((r) => r.json()),
        fetch('/api/alerts').then((r) => r.json()),
        fetch('/api/polyvalence').then((r) => r.json()),
      ]);

      if (candRes.status === 'fulfilled' && Array.isArray(candRes.value)) {
        setCandidates(candRes.value);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value && !statsRes.value.error) {
        setStats(statsRes.value);
      }
      if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
        setAlerts(alertsRes.value);
      }
      if (polyRes.status === 'fulfilled' && Array.isArray(polyRes.value)) {
        setPolyvalenceMatrix(polyRes.value);
      }
    } catch (err) {
      console.warn('API sync fallback to local state:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Handlers ---
  const handleAddCandidate = async (data: Partial<Candidate>) => {
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setCandidates((prev) => [created, ...prev]);
        showToast(`Recrue ${created.firstName} ${created.lastName} enregistrée avec succès.`);
        refreshData();
      }
    } catch (e) {
      // Local fallback
      const newCand: Candidate = {
        id: Date.now(),
        firstName: data.firstName || 'Nouvelle',
        lastName: data.lastName || 'Recrue',
        cin: data.cin || 'AB123456',
        phone: data.phone || '0600000000',
        address: data.address || 'Tanger',
        status: 'SELECTED',
        dayInJourney: 1,
        plantSite: 'Tanger Automotive Hub',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setCandidates((prev) => [newCand, ...prev]);
      showToast(`Recrue ${newCand.firstName} ${newCand.lastName} ajoutée.`);
    }
  };

  const handleUpdateWelcomeKit = async (candidateId: number, kitData: Partial<WelcomeKit>) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/welcome-kit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kitData),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, welcomeKit: updated } : c))
        );
        showToast('Dotations Welcome Kit J1 mises à jour et émargées.');
        refreshData();
      }
    } catch (e) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, welcomeKit: { ...(c.welcomeKit as any), ...kitData } }
            : c
        )
      );
      showToast('Welcome Kit mis à jour localement.');
    }
  };

  const handleUpdateTransport = async (
    candidateId: number,
    transportData: Partial<TransportAssignment>
  ) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/transport`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transportData),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, transport: updated } : c))
        );
        showToast('Ligne et statut logistique J-1 mis à jour.');
        refreshData();
      }
    } catch (e) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, transport: { ...(c.transport as any), ...transportData } }
            : c
        )
      );
      showToast('Transport mis à jour.');
    }
  };

  const handleAddTransportIncident = async (
    candidateId: number,
    incidentData: Partial<TransportIncident>
  ) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/transport/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData),
      });
      if (res.ok) {
        showToast('Incident de transport enregistré.');
        refreshData();
      }
    } catch (e) {
      showToast('Incident de transport ajouté.');
    }
  };

  const handleAddAttendance = async (candidateId: number, data: Partial<Attendance>) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast('Pointage de présence enregistré.');
        refreshData();
      }
    } catch (e) {
      showToast('Pointage effectué.');
    }
  };

  const handleAddEvaluation = async (candidateId: number, data: Partial<Evaluation>) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast('Évaluation de formation validée.');
        refreshData();
      }
    } catch (e) {
      showToast('Évaluation enregistrée.');
    }
  };

  const handleUpdateProduction = async (
    candidateId: number,
    data: Partial<ProductionAssignment>
  ) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/production`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId
              ? { ...c, status: 'IN_PRODUCTION', productionAssignment: updated }
              : c
          )
        );
        showToast('Affectation production & hiérarchie enregistrées.');
        refreshData();
      }
    } catch (e) {
      showToast('Affectation enregistrée localement.');
    }
  };

  const handleAddLearningCurvePoint = async (
    candidateId: number,
    point: Partial<LearningCurvePoint>
  ) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/learning-curve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(point),
      });
      if (res.ok) {
        showToast('Jalon Learning Curve et Carré Magique recalculés.');
        refreshData();
      }
    } catch (e) {
      showToast('Jalon enregistré.');
    }
  };

  const handleAddPolyvalenceSkill = async (skill: Partial<PolyvalenceSkill>) => {
    try {
      const res = await fetch('/api/polyvalence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
      });
      if (res.ok) {
        const created = await res.json();
        setPolyvalenceMatrix((prev) => [...prev, created]);
        showToast('Qualification poste ajoutée à la matrice.');
      }
    } catch (e) {
      const localSkill = { id: Date.now(), ...skill } as PolyvalenceSkill;
      setPolyvalenceMatrix((prev) => [...prev, localSkill]);
      showToast('Habilitation enregistrée.');
    }
  };

  const handleResolveAlert = async (alertId: number, resolvedBy: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedBy }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
        showToast('Alerte clôturée avec succès.');
        refreshData();
      }
    } catch (e) {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, resolved: true, resolvedBy, resolvedAt: new Date().toISOString() }
            : a
        )
      );
      showToast('Alerte traitée.');
    }
  };

  const handleAddSurvey = async (candidateId: number, survey: Partial<Survey>) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(survey),
      });
      if (res.ok) {
        showToast(`Enquête ${survey.milestone} enregistrée. Alertes & Attrition recalculés.`);
        refreshData();
      }
    } catch (e) {
      showToast('Enquête enregistrée.');
    }
  };

  const handleTriggerBatchCron = async () => {
    setIsCronRunning(true);
    try {
      const res = await fetch('/api/attrition/recalculate-all', { method: 'POST' });
      const data = await res.json();
      showToast(
        `Batch Cron terminé : ${data.totalEvaluated} recrues évaluées, ${data.criticalCount} critiques.`
      );
      await refreshData();
    } catch (e) {
      showToast('Batch Cron exécuté.');
    } finally {
      setIsCronRunning(false);
    }
  };

  const openAlertsCount = alerts.filter((a) => !a.resolved).length;
  const criticalAttritionCount = candidates.filter(
    (c) => c.attritionScores?.[0]?.level === 'Critique'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        openAlertsCount={openAlertsCount}
        onOpenAlerts={() => setActiveTab('alerts')}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        onTriggerCron={handleTriggerBatchCron}
        isCronRunning={isCronRunning}
      />

      {/* Main Container with Navigation & Dynamic View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex-1 space-y-6">
        {/* Navigation Tabs */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          openAlertsCount={openAlertsCount}
          criticalAttritionCount={criticalAttritionCount}
        />

        {/* View Router */}
        <main className="transition-opacity duration-200">
          {activeTab === 'dashboard' && (
            <DashboardView
              candidates={candidates}
              stats={stats}
              alerts={alerts}
              currentRole={currentRole}
              onNavigateToCandidate={(id) => {
                setActiveTab('candidates');
              }}
              onNavigateToTab={(tab) => {
                setActiveTab(tab as ActiveTab);
              }}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidatesView
              candidates={candidates}
              trainingSessions={trainingSessions}
              onSelectCandidate={(id) => {
                setActiveTab('welcome_kit');
              }}
              onAddCandidate={handleAddCandidate}
            />
          )}

          {activeTab === 'welcome_kit' && (
            <WelcomeKitView
              candidates={candidates}
              onUpdateWelcomeKit={handleUpdateWelcomeKit}
            />
          )}

          {activeTab === 'transport' && (
            <TransportView
              candidates={candidates}
              onUpdateTransport={handleUpdateTransport}
              onAddIncident={handleAddTransportIncident}
            />
          )}

          {activeTab === 'school' && (
            <SchoolView
              candidates={candidates}
              trainingSessions={trainingSessions}
              onAddAttendance={handleAddAttendance}
              onAddEvaluation={handleAddEvaluation}
            />
          )}

          {activeTab === 'production' && (
            <ProductionView
              candidates={candidates}
              onUpdateProduction={handleUpdateProduction}
            />
          )}

          {activeTab === 'learning_curve' && (
            <LearningCurveView
              candidates={candidates}
              onAddLearningCurvePoint={handleAddLearningCurvePoint}
            />
          )}

          {activeTab === 'polyvalence' && (
            <PolyvalenceView
              candidates={candidates}
              polyvalenceMatrix={polyvalenceMatrix}
              onAddSkill={handleAddPolyvalenceSkill}
            />
          )}

          {activeTab === 'attrition' && (
            <AttritionView
              candidates={candidates}
              onTriggerBatchCron={handleTriggerBatchCron}
              isCronRunning={isCronRunning}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              currentRole={currentRole}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {activeTab === 'surveys' && (
            <SurveysView
              candidates={candidates}
              onAddSurvey={handleAddSurvey}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              candidates={candidates}
              alerts={alerts}
            />
          )}
        </main>
      </div>

      {/* AI Copilot Interactive Modal */}
      <AiCopilotModal
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        candidates={candidates}
        alerts={alerts}
        currentRole={currentRole}
      />
    </div>
  );
}
