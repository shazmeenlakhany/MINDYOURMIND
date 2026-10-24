import {
  ActionItem,
  CognitiveReframe,
  DayChallenge,
  ParkingLotItem,
  DailyCompass,
  InspirationSpark,
  CareerProfile,
  CareerBadge,
  ChatMessage,
} from '../types';

const STORAGE_KEYS = {
  ACTIONS: 'auramind_actions_v1',
  REFRAMES: 'auramind_reframes_v1',
  CHALLENGES: 'auramind_challenges_v1',
  PARKING_LOT: 'auramind_parking_v1',
  COMPASS: 'auramind_compass_v1',
  RAW_DUMP: 'auramind_last_dump_v1',
  FOCUS_STATS: 'auramind_focus_stats_v1',
  INSPIRATIONS: 'auramind_inspirations_v1',
  CAREER_PROFILE: 'auramind_career_v1',
  CHAT_MESSAGES: 'auramind_chat_v1',
};

export const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: 'seed-act-1',
    title: 'Finalize the project outline & core deliverables',
    priority: 'now',
    estimatedMinutes: 25,
    microFirstStep: 'Open the doc, review only section 1 heading for 60 seconds.',
    energyLevel: 'high',
    completed: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'seed-act-2',
    title: 'Respond to the 2 time-sensitive team inquiries',
    priority: 'next',
    estimatedMinutes: 15,
    microFirstStep: 'Write 2-sentence direct replies without over-polishing.',
    energyLevel: 'medium',
    completed: false,
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'seed-act-3',
    title: 'Audit subscriptions & clear clutter from download folder',
    priority: 'later',
    estimatedMinutes: 10,
    microFirstStep: 'Sort downloads by date and delete the top 5 temporary files.',
    energyLevel: 'low',
    completed: false,
    createdAt: Date.now() - 14400000,
  },
];

export const INITIAL_REFRAMES: CognitiveReframe[] = [
  {
    id: 'seed-ref-1',
    worryOrObstacle: 'Fear that I am falling behind because there is always more to do.',
    cognitiveDistortion: 'All-or-Nothing / Relentless Standards',
    realityCheck: 'Work expands indefinitely. Peace comes from choosing a deliberate finish line each day, not from clearing infinity.',
    circleOfControl: 'in_control',
    actionableShift: 'Define 1 primary completion today. Once done, permit the mind to rest.',
    resolved: false,
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'seed-ref-2',
    worryOrObstacle: 'Anxiety about a complex conversation or potential friction.',
    cognitiveDistortion: 'Catastrophizing & Anticipatory Dread',
    realityCheck: 'Most tension lives in the anticipation. Direct, calm communication dispels 90% of imagined friction.',
    circleOfControl: 'influence',
    actionableShift: 'Focus on expressing your needs calmly; leave the other person’s reaction in their circle.',
    resolved: false,
    createdAt: Date.now() - 5000000,
  },
];

export const INITIAL_CHALLENGES: DayChallenge[] = [
  {
    id: 'seed-chal-1',
    challenge: 'Midday mental fog & urge to reach for phone/distractions',
    rootFriction: 'Dopamine seeking triggered by temporary cognitive resistance to hard work.',
    frictionBusterStrategy: 'The 2-Minute Bridge: Stand up, take 3 deep belly breaths, drink water, and commit to just 120 seconds of typing.',
    immediateNextStep: 'Close social media tabs and start the focus timer for 15 minutes.',
    status: 'active',
    createdAt: Date.now() - 2000000,
  },
];

export const INITIAL_PARKING: ParkingLotItem[] = [
  {
    id: 'seed-park-1',
    note: 'Explore redesigning the personal weekend book reading list',
    reviewWhen: 'Saturday morning coffee',
    archived: false,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'seed-park-2',
    note: 'Look into upgraded ergonomic desk setup / monitor riser',
    reviewWhen: 'End of month review',
    archived: false,
    createdAt: Date.now() - 43200000,
  },
];

export const INITIAL_COMPASS: DailyCompass = {
  date: new Date().toISOString().split('T')[0],
  topPriority: 'Ship the core deliverable with calm focus',
  potentialPitfall: 'Fragmenting attention across Slack and email tabs',
  lettingGoOf: 'The feeling that everything must be answered within 2 minutes',
  dailyNorthStar: 'Single-task devotion: Progress is measured by depth, not frantic speed.',
  obstacleArmor: 'When distractions pull, pause and take one physiologic sigh before responding.',
  lightnessAnchor: 'Your worth is not tied to your task list volume.',
  recommendedFocusBlock: 'Two uninterrupted 25-minute focus sprints before lunch',
};

export const INITIAL_INSPIRATIONS: InspirationSpark[] = [
  {
    id: 'spark-1',
    quoteOrWisdom: 'Action does not follow motivation; motivation follows the first small physical action.',
    author: 'Jerome Bruner',
    philosophicalContext: 'Waiting to feel inspired creates an artificial bottleneck. The brain only triggers dopamine once it registers forward motion.',
    groundedReflect: 'You do not need to feel ready or energized. You only need to lower the threshold of the first 2 minutes so low that resistance vanishes.',
    sparkMicroAction: 'Open the primary document or tool, take 1 slow breath, and spend 90 seconds in focused contact.',
    affirmation: 'I do not wait for motivation. I create it with one tiny movement.',
    category: 'Overcoming Inertia',
    savedAt: Date.now() - 86400000,
    isFavorite: true,
  },
  {
    id: 'spark-2',
    quoteOrWisdom: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'Marcus Aurelius',
    philosophicalContext: 'Resistance is not proof that you are failing; it is simply the natural byproduct of tackling something meaningful.',
    groundedReflect: 'Treat the current obstacle as a deliberate training ground. Difficulty is the curriculum, not the enemy.',
    sparkMicroAction: 'Identify the exact sticky point causing hesitation and name it out loud without judgment.',
    affirmation: 'I do not run from difficulty; I let it sharpen my focus.',
    category: 'Mental Resilience',
    savedAt: Date.now() - 43200000,
    isFavorite: true,
  },
  {
    id: 'spark-3',
    quoteOrWisdom: 'When we are no longer able to change a situation, we are challenged to change ourselves.',
    author: 'Viktor Frankl',
    philosophicalContext: 'True freedom lies in the unassailable space between an external trigger and your conscious response.',
    groundedReflect: 'You may not control every deadline or demand today, but you hold absolute sovereignty over your poise and attention.',
    sparkMicroAction: 'Drop your shoulders, release jaw tension, and decide how you will carry yourself in this next hour.',
    affirmation: 'I am the calm sovereign of my inner state.',
    category: 'Inner Poise',
    savedAt: Date.now() - 21600000,
    isFavorite: false,
  },
];

export const storage = {
  getInspirations(): InspirationSpark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INSPIRATIONS);
      return data ? JSON.parse(data) : INITIAL_INSPIRATIONS;
    } catch {
      return INITIAL_INSPIRATIONS;
    }
  },
  saveInspirations(sparks: InspirationSpark[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.INSPIRATIONS, JSON.stringify(sparks));
    } catch {}
  },

  getActions(): ActionItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIONS);
      return data ? JSON.parse(data) : INITIAL_ACTIONS;
    } catch {
      return INITIAL_ACTIONS;
    }
  },
  saveActions(actions: ActionItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    } catch {}
  },

  getReframes(): CognitiveReframe[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFRAMES);
      return data ? JSON.parse(data) : INITIAL_REFRAMES;
    } catch {
      return INITIAL_REFRAMES;
    }
  },
  saveReframes(reframes: CognitiveReframe[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.REFRAMES, JSON.stringify(reframes));
    } catch {}
  },

  getChallenges(): DayChallenge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      return data ? JSON.parse(data) : INITIAL_CHALLENGES;
    } catch {
      return INITIAL_CHALLENGES;
    }
  },
  saveChallenges(challenges: DayChallenge[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    } catch {}
  },

  getParkingLot(): ParkingLotItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARKING_LOT);
      return data ? JSON.parse(data) : INITIAL_PARKING;
    } catch {
      return INITIAL_PARKING;
    }
  },
  saveParkingLot(items: ParkingLotItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PARKING_LOT, JSON.stringify(items));
    } catch {}
  },

  getCompass(): DailyCompass {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPASS);
      return data ? JSON.parse(data) : INITIAL_COMPASS;
    } catch {
      return INITIAL_COMPASS;
    }
  },
  saveCompass(compass: DailyCompass) {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPASS, JSON.stringify(compass));
    } catch {}
  },

  getFocusStats(): { completedSessions: number; totalMinutes: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOCUS_STATS);
      return data ? JSON.parse(data) : { completedSessions: 3, totalMinutes: 75 };
    } catch {
      return { completedSessions: 3, totalMinutes: 75 };
    }
  },
  saveFocusStats(stats: { completedSessions: number; totalMinutes: number }) {
    try {
      localStorage.setItem(STORAGE_KEYS.FOCUS_STATS, JSON.stringify(stats));
    } catch {}
  },

  getCareerProfile(): CareerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAREER_PROFILE);
      return data ? JSON.parse(data) : INITIAL_CAREER_PROFILE;
    } catch {
      return INITIAL_CAREER_PROFILE;
    }
  },
  saveCareerProfile(profile: CareerProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.CAREER_PROFILE, JSON.stringify(profile));
    } catch {}
  },

  getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      return data ? JSON.parse(data) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  },
  saveChatMessages(msgs: ChatMessage[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(msgs));
    } catch {}
  },
};

export const INITIAL_CAREER_PROFILE: CareerProfile = {
  level: 2,
  title: 'Consistent Practitioner',
  xp: 220,
  xpToNextLevel: 350,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalUpskillMinutes: 45,
  totalFocusMinutes: 125,
  tasksCompletedTotal: 7,
  accountabilityJarForfeits: 0,
  lifeGoal: 'Master full-stack craft & autonomous software systems that create genuine human impact while preserving inner calm.',
  oneYearPlan: 'Advance to Senior Architect by shipping 2 production apps, mastering AI integration, and protecting daily deep work.',
  oneYearMilestones: [
    'Ship 2 end-to-end production applications with real users',
    'Master modern AI architecture, backend systems, and responsive craft',
    'Establish an unbroken 90-minute morning deep focus ritual',
  ],
  currentDayGoal: 'Ship the core deliverable outline and log 20 minutes of deliberate upskilling',
  alignmentScorePercent: 85,
  strategicInsight: 'Your morning focus sprint directly powers your 1-Year Senior Architect plan. Defend it from reactive emails.',
  activeContract: {
    id: 'contract-demo',
    task: 'Complete 20 minutes of Python or Core Skill practice',
    deadline: 'Today before 4:00 PM',
    reward: 'Coffee break + unlocked 40Hz Flow track',
    forfeit: '20 pushups immediately + donate $2 to the Accountability Jar',
    status: 'active',
    createdAt: Date.now() - 3600000,
  },
  contractHistory: [
    {
      id: 'contract-hist-1',
      task: 'Draft initial project brief without phone interruption',
      deadline: 'Yesterday 2:00 PM',
      reward: '30-minute evening walk guilt-free',
      forfeit: 'No social media for the entire evening',
      status: 'fulfilled',
      createdAt: Date.now() - 86400000,
      settledAt: Date.now() - 80000000,
    },
  ],
  badges: [
    {
      id: 'first_spark',
      title: 'First Spark',
      desc: 'Completed your very first single-task focus sprint.',
      icon: '⚡',
      unlocked: true,
      unlockedAt: Date.now() - 86400000,
    },
    {
      id: 'apprentice_60',
      title: '60m Deep Work',
      desc: 'Logged 60+ minutes of uninterrupted deep focus.',
      icon: '🎯',
      unlocked: true,
      unlockedAt: Date.now() - 43200000,
    },
    {
      id: 'streak_3',
      title: '3-Day Consistency Streak',
      desc: 'Returned and anchored your clarity for 3 consecutive days.',
      icon: '🔥',
      unlocked: true,
      unlockedAt: Date.now() - 86400000,
    },
    {
      id: 'upskiller_30',
      title: 'Craft Upskiller',
      desc: 'Dedicated 30+ minutes to deliberate upskilling.',
      icon: '📚',
      unlocked: true,
      unlockedAt: Date.now() - 20000000,
    },
    {
      id: 'iron_integrity',
      title: 'Iron Integrity',
      desc: 'Fulfilled an accountability contract without taking a forfeit.',
      icon: '🛡️',
      unlocked: true,
      unlockedAt: Date.now() - 80000000,
    },
    {
      id: 'friction_slayer',
      title: 'Friction Slayer',
      desc: 'Reframed a daunting day-to-day challenge into micro-steps.',
      icon: '🧠',
      unlocked: false,
    },
  ],
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-seed-1',
    role: 'assistant',
    text: "Welcome back. I am AuraMentor, your executive clarity coach and career accountability partner.\n\nWhether you woke up feeling demotivated, need to upskill in your craft, or have an active accountability stake on the line—I am in your corner. What is the single highest-leverage task we are committing to right now?",
    timestamp: Date.now() - 60000,
  },
];

export function calculateCareerLevel(xp: number): { level: number; title: string; xpToNextLevel: number; progressPercent: number } {
  if (xp < 150) {
    return { level: 1, title: 'Apprentice of Focus', xpToNextLevel: 150, progressPercent: Math.round((xp / 150) * 100) };
  } else if (xp < 350) {
    return { level: 2, title: 'Consistent Practitioner', xpToNextLevel: 350, progressPercent: Math.round(((xp - 150) / 200) * 100) };
  } else if (xp < 650) {
    return { level: 3, title: 'Deep Work Specialist', xpToNextLevel: 650, progressPercent: Math.round(((xp - 350) / 300) * 100) };
  } else if (xp < 1050) {
    return { level: 4, title: 'Senior Strategist', xpToNextLevel: 1050, progressPercent: Math.round(((xp - 650) / 400) * 100) };
  } else {
    return { level: 5, title: 'Master Craftsman / Executive Mind', xpToNextLevel: 2000, progressPercent: Math.min(100, Math.round(((xp - 1050) / 950) * 100)) };
  }
}

