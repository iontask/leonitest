import { Candidate, AttritionScore, AttritionFactors, Alert } from '../types';

export function calculateAttritionScore(candidate: Candidate): AttritionScore {
  const explanations: string[] = [];
  let absencesScore = 0;
  let punctualityScore = 0;
  let satisfactionScore = 0;
  let schoolEvaluationScore = 0;
  let productivityGapScore = 0;
  let defectRateScore = 0;
  let transportRiskScore = 0;
  let welcomeKitDelayScore = 0;
  let postComplexityScore = 0;

  // 1. Absences Analysis (Weight ~20%)
  const attendances = candidate.attendances || [];
  const totalAbsences = attendances.filter((a) => a.status === 'ABSENT').length;
  const earlyAbsences = attendances.filter(
    (a) => a.status === 'ABSENT' && a.phase === 'school'
  ).length;

  if (earlyAbsences >= 2) {
    absencesScore = 95;
    explanations.push(`≥2 absences lors des 5 premiers jours (${earlyAbsences} absences école)`);
  } else if (totalAbsences >= 2) {
    absencesScore = 80;
    explanations.push(`${totalAbsences} absences enregistrées au cours du parcours`);
  } else if (totalAbsences === 1) {
    absencesScore = 40;
    explanations.push(`1 absence enregistrée`);
  }

  // 2. Punctuality & Retards (Weight ~10%)
  const totalLates = attendances.filter((a) => a.status === 'LATE').length;
  if (totalLates >= 3) {
    punctualityScore = 85;
    explanations.push(`Retards répétés (${totalLates} retards enregistrés)`);
  } else if (totalLates >= 1) {
    punctualityScore = 45;
    explanations.push(`${totalLates} retard(s) au pointage`);
  }

  // 3. Satisfaction Analysis (Weight ~25%)
  const surveys = candidate.surveys || [];
  const latestSurvey = surveys.length > 0 ? surveys[surveys.length - 1] : null;
  if (latestSurvey) {
    if (latestSurvey.satisfaction < 40) {
      satisfactionScore = 100;
      explanations.push(`Satisfaction critique <40% (${latestSurvey.satisfaction}%) - Entretien RH urgent requis`);
    } else if (latestSurvey.satisfaction < 60) {
      satisfactionScore = 75;
      explanations.push(`Satisfaction terrain basse <60% (${latestSurvey.satisfaction}%)`);
    } else if (latestSurvey.satisfaction < 75) {
      satisfactionScore = 40;
      explanations.push(`Satisfaction modérée (${latestSurvey.satisfaction}%)`);
    } else {
      satisfactionScore = 10;
    }
  } else {
    // If candidate has completed 5 days but no survey filled
    if (candidate.dayInJourney >= 5) {
      satisfactionScore = 30;
    }
  }

  // 4. Evaluations École (Weight ~10%)
  const evaluations = candidate.evaluations || [];
  const unvalidated = evaluations.filter((e) => e.trainerValidation === false).length;
  const avgQuiz = evaluations.length
    ? evaluations.reduce((acc, e) => acc + (e.quizScore || e.examScore || 0), 0) / evaluations.length
    : 80;
  if (unvalidated > 0 || avgQuiz < 70) {
    schoolEvaluationScore = 70;
    explanations.push(`Difficultés de validation école (Quiz moy: ${Math.round(avgQuiz)}/100)`);
  } else if (avgQuiz < 80) {
    schoolEvaluationScore = 35;
  }

  // 5. Productivity Gap on Learning Curve (Weight ~15%)
  const lcPoints = candidate.learningCurvePoints || [];
  if (lcPoints.length > 0) {
    const latestLc = lcPoints[lcPoints.length - 1];
    const gap = latestLc.targetProductivity - latestLc.productivity;
    if (gap > 25) {
      productivityGapScore = 90;
      explanations.push(`Écart sévère sur la Learning Curve (${latestLc.productivity}% vs cible ${latestLc.targetProductivity}%)`);
    } else if (gap > 12) {
      productivityGapScore = 55;
      explanations.push(`Léger retard de cadence (${latestLc.productivity}% vs cible ${latestLc.targetProductivity}%)`);
    }
  }

  // 6. Quality & Defect Rate (Weight ~10%)
  if (lcPoints.length > 0) {
    const latestQuality = lcPoints[lcPoints.length - 1].quality;
    if (latestQuality < 92) {
      defectRateScore = 80;
      explanations.push(`Taux de conformité qualité FPY inférieur aux standards (${latestQuality}%)`);
    } else if (latestQuality < 96) {
      defectRateScore = 35;
    }
  }

  // 7. Transport Risk (Weight ~10%)
  const transport = candidate.transport;
  const incidents = transport?.incidents || [];
  if (incidents.length >= 2 || (transport?.travelTimeMin && transport.travelTimeMin > 45)) {
    transportRiskScore = 70;
    explanations.push(`Risque transport : temps de trajet élevé (${transport?.travelTimeMin || 50} min) ou incidents récurrents`);
  } else if (incidents.length === 1) {
    transportRiskScore = 35;
  }

  // 8. Welcome Kit J1 incomplete (Weight ~5%)
  const wk = candidate.welcomeKit;
  if (wk && (!wk.vestGiven || !wk.blouseGiven || !wk.contractGiven || !wk.badgeGiven || !wk.lockerGiven || !wk.ppeGiven)) {
    welcomeKitDelayScore = 50;
    const missing: string[] = [];
    if (!wk.lockerGiven) missing.push('casier');
    if (!wk.badgeGiven) missing.push('badge');
    if (!wk.ppeGiven) missing.push('EPI');
    if (!wk.blouseGiven) missing.push('blouse');
    explanations.push(`Welcome Kit incomplet à l accueil J1 (manque: ${missing.join(', ') || 'équipements'})`);
  }

  // 9. Post Complexity & Criticality
  if (candidate.productionAssignment?.isCritical && candidate.productionAssignment?.isBottleneck) {
    postComplexityScore = 60;
    explanations.push('Affecté sur un poste critique / goulot d étranglement haute tension');
  } else if (candidate.productionAssignment?.positionType === 'complexe') {
    postComplexityScore = 40;
  }

  // Weighted sum
  const totalScoreRaw =
    absencesScore * 0.22 +
    satisfactionScore * 0.24 +
    productivityGapScore * 0.16 +
    transportRiskScore * 0.10 +
    punctualityScore * 0.08 +
    schoolEvaluationScore * 0.08 +
    defectRateScore * 0.05 +
    welcomeKitDelayScore * 0.04 +
    postComplexityScore * 0.03;

  const score = Math.min(100, Math.max(0, Math.round(totalScoreRaw)));

  let level: 'Faible' | 'Moyen' | 'Critique' = 'Faible';
  if (score >= 71) {
    level = 'Critique';
  } else if (score >= 41) {
    level = 'Moyen';
  }

  const factors: AttritionFactors = {
    absencesScore,
    punctualityScore,
    satisfactionScore,
    schoolEvaluationScore,
    productivityGapScore,
    defectRateScore,
    transportRiskScore,
    welcomeKitDelayScore,
    postComplexityScore,
    explanation: explanations.length > 0 ? explanations : ['Parcours conforme aux jalons sans anomalie identifiée.'],
  };

  const actionPlans: string[] = [];
  if (level === 'Critique') {
    actionPlans.push('Organiser un entretien RH prioritaire sous 24h avec le responsable d intégration');
    actionPlans.push('Vérifier avec le Hancho la cadence du poste et affecter un jumper / tuteur de renfort');
    if (transportRiskScore > 50) actionPlans.push('Examiner le changement de ligne de navette ou ajuster l arrêt de ramassage');
    if (welcomeKitDelayScore > 0) actionPlans.push('Régulariser immédiatement le casier ou l EPI manquant');
  } else if (level === 'Moyen') {
    actionPlans.push('Faire un point de situation à mi-semaine avec le Team Speaker');
    actionPlans.push('Renforcer le soutien technique sur les gammes opératoires sensibles');
  } else {
    actionPlans.push('Maintenir le plan d intégration standard et le calendrier des jalons J+28/J+90');
  }

  return {
    id: candidate.id * 1000 + 1,
    candidateId: candidate.id,
    score,
    level,
    factors,
    computedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    aiRecommendation:
      level === 'Critique'
        ? `Alerte Rouge : Probabilité élevée de désistement avant 30 jours (${score}%). Actions correctives coordonnées requises entre RH, Hancho et Logistique transport.`
        : level === 'Moyen'
        ? `Vigilance Jaune : Progression ralentie ou signaux faibles (${score}%). Un accompagnement terrain renforcé préviendra le désistement.`
        : `Feu Vert : Trajectoire d intégration stable et saine (${score}% de risque).`,
    aiActionPlan: actionPlans,
  };
}

export function detectCandidateAlerts(candidate: Candidate): Alert[] {
  const alerts: Alert[] = [];
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  // 1. Absences in first 5 days
  const earlyAbsences = (candidate.attendances || []).filter(
    (a) => a.status === 'ABSENT' && a.phase === 'school'
  ).length;
  if (earlyAbsences >= 2) {
    alerts.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      candidateId: candidate.id,
      candidateName: fullName,
      type: 'absence',
      condition: `≥2 absences durant les 5 premiers jours (${earlyAbsences} constatées)`,
      severity: 'CRITICAL',
      recipientRole: 'FORMATION',
      resolved: false,
      createdAt: now,
    });
  }

  // 2. Cascading satisfaction alerts
  const latestSurvey = candidate.surveys?.[candidate.surveys.length - 1];
  if (latestSurvey) {
    if (latestSurvey.satisfaction < 40) {
      alerts.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        candidateId: candidate.id,
        candidateName: fullName,
        type: 'satisfaction',
        condition: `Satisfaction < 40% (Score: ${latestSurvey.satisfaction}%) — Entretien RH obligatoire`,
        severity: 'CRITICAL',
        recipientRole: 'RH',
        resolved: false,
        createdAt: now,
      });
    } else if (latestSurvey.satisfaction < 60) {
      alerts.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        candidateId: candidate.id,
        candidateName: fullName,
        type: 'satisfaction',
        condition: `Satisfaction < 60% (Score: ${latestSurvey.satisfaction}%) — Alerte manager`,
        severity: 'WARNING',
        recipientRole: 'SHIFT_LEADER',
        resolved: false,
        createdAt: now,
      });
    }
  }

  // 3. Learning curve productivity gap
  const lc = candidate.learningCurvePoints || [];
  if (lc.length > 0) {
    const latest = lc[lc.length - 1];
    if (latest.targetProductivity - latest.productivity >= 25) {
      alerts.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        candidateId: candidate.id,
        candidateName: fullName,
        type: 'productivity',
        condition: `Productivité réelle (${latest.productivity}%) nettement en dessous de la cible (${latest.targetProductivity}%)`,
        severity: 'WARNING',
        recipientRole: 'SEGMENT_LEADER',
        resolved: false,
        createdAt: now,
      });
    }
  }

  // 4. Welcome kit incomplete at J1
  const wk = candidate.welcomeKit;
  if (wk && (!wk.vestGiven || !wk.blouseGiven || !wk.contractGiven || !wk.badgeGiven || !wk.lockerGiven || !wk.ppeGiven)) {
    alerts.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      candidateId: candidate.id,
      candidateName: fullName,
      type: 'welcome_kit',
      condition: `Dotation Welcome Kit incomplète à J1`,
      severity: 'INFO',
      recipientRole: 'RH',
      resolved: false,
      createdAt: now,
    });
  }

  // 5. Recurring transport incidents
  if ((candidate.transport?.incidents || []).length >= 2) {
    alerts.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      candidateId: candidate.id,
      candidateName: fullName,
      type: 'transport',
      condition: `Problèmes de transport récurrents (${candidate.transport?.incidents.length} incidents navette)`,
      severity: 'WARNING',
      recipientRole: 'RH',
      resolved: false,
      createdAt: now,
    });
  }

  return alerts;
}
