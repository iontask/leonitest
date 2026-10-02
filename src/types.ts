export type CandidateStatus =
  | 'PENDING'
  | 'SELECTED'
  | 'REJECTED'
  | 'IN_TRAINING'
  | 'IN_PRODUCTION'
  | 'DEPARTED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export type UserRole =
  | 'RH'
  | 'FORMATION'
  | 'PSM'
  | 'TEAM_SPEAKER'
  | 'HANCHO'
  | 'SHIFT_LEADER'
  | 'SEGMENT_LEADER'
  | 'PLANT_MANAGER'
  | 'ADMIN';

export type PositionType = 'simple' | 'moyen' | 'complexe';

export type SurveyMilestone = 'J5_ECOLE' | 'J5_TERRAIN' | 'J28' | 'J90';

export interface WelcomeKit {
  id: number;
  candidateId: number;
  vestGiven: boolean;
  blouseGiven: boolean;
  contractGiven: boolean;
  badgeGiven: boolean;
  lockerGiven: boolean;
  bookletGiven: boolean;
  ppeGiven: boolean;
  signedAt?: string;
  signatureDataUrl?: string;
  responsibleId?: number;
  responsibleName?: string;
}

export interface TransportIncident {
  id: number;
  transportAssignmentId: number;
  type: 'retard' | 'absence';
  date: string;
  notes?: string;
}

export interface TransportAssignment {
  id: number;
  candidateId: number;
  lineName?: string;
  pickupPoint?: string;
  schedule?: string;
  distanceKm?: number;
  travelTimeMin?: number;
  confirmed: boolean;
  validatedAt?: string;
  incidents: TransportIncident[];
}

export interface Attendance {
  id: number;
  candidateId: number;
  date: string;
  status: AttendanceStatus;
  phase: 'school' | 'production';
  notes?: string;
}

export interface Evaluation {
  id: number;
  candidateId: number;
  type: 'theory' | 'practice';
  quizScore?: number;
  examScore?: number;
  practicalScore?: number;
  trainerValidation?: boolean;
  date: string;
  notes?: string;
}

export interface ProductionAssignment {
  id: number;
  candidateId: number;
  segment?: string;
  line?: string;
  shift?: string;
  position?: string;
  jobFamily?: string;
  positionType?: PositionType;
  isCritical: boolean;
  isBottleneck: boolean;
  trainerId?: number;
  trainerName?: string;
  teamSpeakerId?: number;
  teamSpeakerName?: string;
  hanchoId?: number;
  hanchoName?: string;
  shiftLeaderId?: number;
  shiftLeaderName?: string;
  segmentLeaderId?: number;
  segmentLeaderName?: string;
}

export interface LearningCurvePoint {
  id: number;
  candidateId: number;
  date: string;
  dayNumber: number; // 1 to 28
  productivity: number; // actual % (e.g. 75)
  targetProductivity: number; // benchmark % (e.g. 80)
  quality: number; // FPY % (e.g. 96.5)
  presence: boolean;
  discipline: number; // 0-100
  polyvalence: number; // number of mastered posts
  qualification?: string;
}

export interface MagicSquareData {
  candidateId: number;
  qualityScore: number; // 0-100
  productivityScore: number; // 0-100
  polyvalenceScore: number; // 0-100
  disciplineScore: number; // 0-100
  status: 'GREEN' | 'YELLOW' | 'RED';
}

export interface PolyvalenceSkill {
  id: number;
  candidateId: number;
  candidateName: string;
  positionName: string;
  segment: string;
  line: string;
  masteryLevel: 1 | 2 | 3 | 4; // 1: Apprenti, 2: Autonome, 3: Confirmé, 4: Expert/Formateur
  isCriticalPost: boolean;
  qualifiedAt?: string;
  targetDate?: string;
}

export interface Survey {
  id: number;
  candidateId: number;
  milestone: SurveyMilestone;
  answers: Record<string, number | string>;
  satisfaction: number; // 0-100
  notes?: string;
  createdAt: string;
}

export interface AttritionFactors {
  absencesScore: number; // contribution to risk (0-100)
  punctualityScore: number;
  satisfactionScore: number;
  schoolEvaluationScore: number;
  productivityGapScore: number;
  defectRateScore: number;
  transportRiskScore: number;
  welcomeKitDelayScore: number;
  postComplexityScore: number;
  explanation: string[];
}

export interface AttritionScore {
  id: number;
  candidateId: number;
  score: number; // 0-100
  level: 'Faible' | 'Moyen' | 'Critique';
  factors: AttritionFactors;
  computedAt: string;
  aiRecommendation?: string;
  aiActionPlan?: string[];
}

export interface Alert {
  id: number;
  candidateId: number;
  candidateName: string;
  type: 'absence' | 'satisfaction' | 'productivity' | 'transport' | 'quality' | 'welcome_kit' | 'learning_curve';
  condition: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  recipientRole: UserRole;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface TrainingSession {
  id: number;
  school: string;
  startDate: string;
  endDate: string;
  cohortName: string;
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  cin: string;
  phone: string;
  address: string;
  plantSite: string;
  cvUrl?: string;
  diplomaScanUrl?: string;
  educationLevel?: string;
  testScore?: number;
  status: CandidateStatus;
  trainingSessionId?: number;
  createdAt: string;
  dayInJourney: number; // Day 1 to 90
  welcomeKit?: WelcomeKit;
  transport?: TransportAssignment;
  attendances?: Attendance[];
  evaluations?: Evaluation[];
  productionAssignment?: ProductionAssignment;
  learningCurvePoints?: LearningCurvePoint[];
  attritionScores?: AttritionScore[];
  surveys?: Survey[];
  magicSquare?: MagicSquareData;
}

export interface DashboardStats {
  totalCandidates: number;
  activeInTraining: number;
  activeInProduction: number;
  retentionRate90Days: number;
  earlyTurnover5Weeks: number;
  readinessScoreJ1: number;
  avgSchoolSuccessRate: number;
  avgQualityFPY: number;
  criticalAttritionCount: number;
  mediumAttritionCount: number;
  lowAttritionCount: number;
  openAlertsCount: number;
}
