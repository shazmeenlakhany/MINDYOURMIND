export type Priority = 'now' | 'next' | 'later';

export interface ActionItem {
  id: string;
  title: string;
  priority: Priority;
  estimatedMinutes: number;
  microFirstStep: string;
  energyLevel: 'low' | 'medium' | 'high';
  category?: 'upskill' | 'work' | 'personal' | 'health';
  alignmentTier?: 'aligned_core' | 'maintenance' | 'drift';
  alignedWithGoal?: string;
  complianceScore?: number;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface CognitiveReframe {
  id: string;
  worryOrObstacle: string;
  cognitiveDistortion?: string;
  realityCheck: string;
  circleOfControl: 'in_control' | 'influence' | 'out_of_control';
  actionableShift: string;
  resolved: boolean;
  createdAt: number;
}

export interface DayChallenge {
  id: string;
  challenge: string;
  rootFriction: string;
  frictionBusterStrategy: string;
  immediateNextStep: string;
  status: 'active' | 'in_progress' | 'resolved';
  createdAt: number;
}

export interface ParkingLotItem {
  id: string;
  note: string;
  reviewWhen: string;
  archived: boolean;
  createdAt: number;
}

export interface DailyCompass {
  date: string;
  topPriority: string;
  potentialPitfall: string;
  lettingGoOf: string;
  dailyNorthStar: string;
  obstacleArmor: string;
  lightnessAnchor: string;
  recommendedFocusBlock?: string;
  eveningReflection?: string;
}

export interface InspirationSpark {
  id: string;
  quoteOrWisdom: string;
  author: string;
  philosophicalContext: string;
  groundedReflect: string;
  sparkMicroAction: string;
  affirmation: string;
  category?: string;
  savedAt: number;
  isFavorite?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface AccountabilityContract {
  id: string;
  task: string;
  deadline: string;
  reward: string;
  forfeit: string;
  status: 'active' | 'fulfilled' | 'forfeited';
  createdAt: number;
  settledAt?: number;
}

export interface CareerBadge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface CareerProfile {
  level: number;
  title: string;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  lastActiveDate: string;
  totalUpskillMinutes: number;
  totalFocusMinutes: number;
  tasksCompletedTotal: number;
  accountabilityJarForfeits: number;
  lifeGoal: string;
  oneYearPlan: string;
  oneYearMilestones: string[];
  currentDayGoal: string;
  alignmentScorePercent: number;
  complianceAuditedAt?: number;
  strategicInsight?: string;
  activeContract: AccountabilityContract | null;
  contractHistory: AccountabilityContract[];
  badges: CareerBadge[];
}

export interface DeclutterResponse {
  mentalStateSummary: string;
  actionItems: ActionItem[];
  cognitiveReframes: CognitiveReframe[];
  dayChallenges: DayChallenge[];
  parkingLot: ParkingLotItem[];
}
