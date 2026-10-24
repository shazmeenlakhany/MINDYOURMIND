import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Heuristic fallback for decluttering when API key is unavailable or fails
function getFallbackDeclutter(rawNotes: string) {
  const lines = rawNotes
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const cleanItems = lines.length > 0 ? lines : ['Organize priorities for today'];

  const actionItems = cleanItems.slice(0, 4).map((text, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    title: text.replace(/^[-*•\d.)\s]+/, ''),
    priority: idx === 0 ? 'now' : idx === 1 ? 'next' : 'later',
    estimatedMinutes: idx === 0 ? 15 : 25,
    microFirstStep: `Open tools and spend the first 2 minutes on: ${text.slice(0, 40)}...`,
    energyLevel: idx === 0 ? 'high' : 'medium',
  }));

  const cognitiveReframes = [
    {
      worryOrObstacle: 'Fear of not finishing everything today',
      cognitiveDistortion: 'All-or-Nothing Thinking',
      realityCheck: 'Cognitive bandwidth is finite. Finishing 1 meaningful thing creates more momentum than stressing over 10.',
      circleOfControl: 'in_control',
      actionableShift: 'Protect focus for the single top priority right now and park the rest with zero guilt.',
    },
  ];

  const dayChallenges = [
    {
      challenge: 'Task switching and ambient mental friction',
      rootFriction: 'Too many unresolved loops occupying working memory.',
      frictionBusterStrategy: 'Single-task boundary: Close auxiliary tabs, start a 25-minute focus burst.',
      immediateNextStep: 'Pick the #1 priority and turn on focus audio.',
    },
  ];

  const parkingLot = cleanItems.slice(4).map((item, idx) => ({
    id: `park-${Date.now()}-${idx}`,
    note: item.replace(/^[-*•\d.)\s]+/, ''),
    reviewWhen: 'Tomorrow or weekly review',
  }));

  return {
    mentalStateSummary: 'Your thoughts show multiple open loops competing for attention. By anchoring into one primary focus item, your working memory will instantly lighten.',
    actionItems,
    cognitiveReframes,
    dayChallenges,
    parkingLot,
  };
}

// POST /api/declutter - Turn raw brain dump into organized clarity
app.post('/api/declutter', async (req: Request, res: Response) => {
  try {
    const { rawNotes } = req.body;
    if (!rawNotes || typeof rawNotes !== 'string' || !rawNotes.trim()) {
      return res.status(400).json({ error: 'Please provide notes to declutter.' });
    }

    if (!ai) {
      const fallback = getFallbackDeclutter(rawNotes);
      return res.json(fallback);
    }

    const prompt = `Analyze this raw stream-of-consciousness brain dump:
"""
${rawNotes.slice(0, 3000)}
"""

Declutter this mental chaos with high psychological precision. Distill it into:
1. "mentalStateSummary": A soothing, 1-2 sentence empathetic observation of where the mind is caught right now.
2. "actionItems": 2 to 5 concrete, single-action micro-tasks with realistic estimatedMinutes (5-45 min), priority ('now' for the single most urgent/impactful, 'next' for followups, 'later' for non-urgent), a clear 2-minute microFirstStep to remove starting friction, and energyLevel ('low' | 'medium' | 'high').
3. "cognitiveReframes": 1 to 3 worries, anxieties, or self-critical thoughts detected in the text, identified cognitive distortion (e.g. Catastrophizing, Should Statements, Mind Reading, All-or-Nothing), a grounded reality check, circleOfControl ('in_control' | 'influence' | 'out_of_control'), and an actionable mental shift.
4. "dayChallenges": 1 to 2 day-to-day challenges or obstacles mentioned (e.g. difficult conversations, fatigue, procrastination, tech friction) with root friction, a practical friction buster strategy, and immediate next step.
5. "parkingLot": Non-immediate ideas, random shower thoughts, or items that should be put on pause so they don't clog today's attention.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a master cognitive clarity psychologist and executive function coach. Your goal is to transform overwhelming mental noise into crisp, calm, actionable direction with zero psychological friction.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mentalStateSummary: { type: Type.STRING },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['now', 'next', 'later'] },
                  estimatedMinutes: { type: Type.INTEGER },
                  microFirstStep: { type: Type.STRING },
                  energyLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                },
                required: ['title', 'priority', 'estimatedMinutes', 'microFirstStep', 'energyLevel'],
              },
            },
            cognitiveReframes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  worryOrObstacle: { type: Type.STRING },
                  cognitiveDistortion: { type: Type.STRING },
                  realityCheck: { type: Type.STRING },
                  circleOfControl: { type: Type.STRING, enum: ['in_control', 'influence', 'out_of_control'] },
                  actionableShift: { type: Type.STRING },
                },
                required: ['worryOrObstacle', 'realityCheck', 'circleOfControl', 'actionableShift'],
              },
            },
            dayChallenges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  challenge: { type: Type.STRING },
                  rootFriction: { type: Type.STRING },
                  frictionBusterStrategy: { type: Type.STRING },
                  immediateNextStep: { type: Type.STRING },
                },
                required: ['challenge', 'rootFriction', 'frictionBusterStrategy', 'immediateNextStep'],
              },
            },
            parkingLot: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  note: { type: Type.STRING },
                  reviewWhen: { type: Type.STRING },
                },
                required: ['note', 'reviewWhen'],
              },
            },
          },
          required: ['mentalStateSummary', 'actionItems', 'cognitiveReframes', 'dayChallenges', 'parkingLot'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(text);
    // ensure IDs
    if (Array.isArray(parsed.actionItems)) {
      parsed.actionItems = parsed.actionItems.map((item: any, i: number) => ({
        ...item,
        id: item.id || `action-${Date.now()}-${i}`,
      }));
    }
    if (Array.isArray(parsed.parkingLot)) {
      parsed.parkingLot = parsed.parkingLot.map((item: any, i: number) => ({
        ...item,
        id: item.id || `park-${Date.now()}-${i}`,
      }));
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error decluttering notes:', error);
    // Graceful fallback so user always gets instant clarity
    const fallback = getFallbackDeclutter(req.body.rawNotes || '');
    return res.json(fallback);
  }
});

// POST /api/reframe-challenge - Deep Cognitive Reframing for a specific day-to-day challenge
app.post('/api/reframe-challenge', async (req: Request, res: Response) => {
  try {
    const { challenge, context } = req.body;
    if (!challenge) {
      return res.status(400).json({ error: 'Please specify the challenge.' });
    }

    if (!ai) {
      return res.json({
        challenge,
        stoicSeparation: {
          withinControl: 'Your immediate response, posture, breath, and the very first 2-minute physical action you choose to take.',
          outsideControl: 'Other people’s initial reactions, future variables, past mistakes, and outcomes.',
        },
        cognitiveDistortion: 'Catastrophizing & Anticipatory Dread',
        perspectiveShift: 'The friction you feel is the brain anticipating exertion before starting. Momentum only begins once physical motion starts.',
        actionSequence: [
          'Take one slow diaphragmatic exhale (physiologic sigh) to down-regulate alert state.',
          'Shrink the challenge to the atomic step: write one single sentence or open one folder.',
          'Commit to only 3 minutes of engagement before deciding whether to stop or continue.',
        ],
        calmAffirmation: 'I do not have to solve the entire mountain right now; I only need to take this one unhurried step.',
      });
    }

    const prompt = `Perform a high-clarity cognitive reframing on this specific day-to-day friction or challenge:
Challenge: "${challenge}"
Context: "${context || 'General work/life friction'}"

Apply Cognitive Behavioral Therapy (CBT) and Stoic circle-of-control wisdom. Provide:
1. stoicSeparation: withinControl (exact things you control right now), outsideControl (things you must let go of).
2. cognitiveDistortion: identify the subconscious narrative amplifying friction (e.g., Mind Reading, Emotional Reasoning, Overgeneralization).
3. perspectiveShift: compassionate yet empowering reframing.
4. actionSequence: exactly 3 sequential, micro-steps that require minimal willpower.
5. calmAffirmation: one grounded, unpretentious mental anchor.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stoicSeparation: {
              type: Type.OBJECT,
              properties: {
                withinControl: { type: Type.STRING },
                outsideControl: { type: Type.STRING },
              },
              required: ['withinControl', 'outsideControl'],
            },
            cognitiveDistortion: { type: Type.STRING },
            perspectiveShift: { type: Type.STRING },
            actionSequence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            calmAffirmation: { type: Type.STRING },
          },
          required: ['stoicSeparation', 'cognitiveDistortion', 'perspectiveShift', 'actionSequence', 'calmAffirmation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ challenge, ...parsed });
  } catch (err: any) {
    console.error('Error in reframe-challenge:', err);
    return res.json({
      challenge: req.body.challenge,
      stoicSeparation: {
        withinControl: 'Your direct focus, physical posture, and the tiny action in front of you.',
        outsideControl: 'Expectations of others, timing beyond today, and future uncertainties.',
      },
      cognitiveDistortion: 'Cognitive Overload',
      perspectiveShift: 'Overwhelm disappears when scope shrinks. Treat this as an isolated 5-minute experiment rather than an all-or-nothing test.',
      actionSequence: [
        'Clear your physical desk surface of unnecessary clutter.',
        'Break this challenge into a micro-action that takes less than 120 seconds.',
        'Execute that single micro-step with no expectation of perfection.',
      ],
      calmAffirmation: 'Clarity is produced by action, not by endless thinking.',
    });
  }
});

// POST /api/morning-clarity - Morning Priming & Daily Compass
app.post('/api/morning-clarity', async (req: Request, res: Response) => {
  try {
    const { topPriority, potentialPitfall, lettingGoOf } = req.body;
    if (!ai) {
      return res.json({
        dailyNorthStar: topPriority || 'Complete your core focus block before noon.',
        obstacleArmor: `When "${potentialPitfall || 'distractions'}" appears, pause for 60 seconds and return to your primary track.`,
        lightnessAnchor: `Release: "${lettingGoOf || 'the need to please everyone today'}".`,
        recommendedFocusBlock: '45-minute deep focus session at 10:00 AM.',
      });
    }

    const prompt = `Synthesize a grounded, calm Daily Compass from this morning clarity check-in:
- Top One Priority: "${topPriority}"
- Potential Pitfall / Derailer: "${potentialPitfall}"
- What they want to let go of: "${lettingGoOf}"

Return a tight, inspiring summary that keeps the user anchored throughout the day.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyNorthStar: { type: Type.STRING },
            obstacleArmor: { type: Type.STRING },
            lightnessAnchor: { type: Type.STRING },
            recommendedFocusBlock: { type: Type.STRING },
          },
          required: ['dailyNorthStar', 'obstacleArmor', 'lightnessAnchor', 'recommendedFocusBlock'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating morning clarity:', err);
    return res.json({
      dailyNorthStar: req.body.topPriority || 'Execute your single highest-leverage task with calm composure.',
      obstacleArmor: `Stay mindful of: "${req.body.potentialPitfall || 'unexpected interruptions'}". Use the focus timer to protect your zone.`,
      lightnessAnchor: `You are releasing: "${req.body.lettingGoOf || 'unnecessary worry'}". Keep moving forward one step at a time.`,
      recommendedFocusBlock: 'Two 25-minute deep focus blocks with a 5-minute breathing break.',
    });
  }
});

// POST /api/spark-inspiration - Dynamic Motivation & Grounded Wisdom
app.post('/api/spark-inspiration', async (req: Request, res: Response) => {
  try {
    const { moodOrStruggle, category } = req.body;
    const struggle = moodOrStruggle || 'general hesitation or low motivation';

    if (!ai) {
      return res.json({
        quoteOrWisdom: 'Action does not follow motivation; motivation follows the first small physical action.',
        author: 'Jerome Bruner',
        philosophicalContext: 'Waiting to feel inspired before beginning creates a mental bottleneck. The brain only generates dopamine once it registers movement.',
        groundedReflect: 'You do not need to feel ready, confident, or energetic. You only need to lower the threshold of the first 2 minutes so low that resistance evaporates.',
        sparkMicroAction: 'Stand up, roll your shoulders back, and perform 90 seconds of work on your top task without checking the clock.',
        affirmation: 'I act first; clarity and motivation arrive in the slipstream.',
      });
    }

    const prompt = `Provide deep, grounded inspiration and psychological motivation for someone experiencing: "${struggle}"
Category: "${category || 'resilience and momentum'}"

Avoid shallow, generic platitudes or toxic positivity. Draw from Stoic philosophy, existential psychology (Viktor Frankl), behavioral neuroscience (dopamine/friction loops), and Eastern mindfulness.

Return JSON with:
1. quoteOrWisdom: A poignant quote or philosophical insight.
2. author: Thinker or source (e.g. Marcus Aurelius, Seneca, Viktor Frankl, Lao Tzu, Carl Jung, James Clear, etc.).
3. philosophicalContext: 1-2 sentences on why this psychological friction exists and how to look at it differently.
4. groundedReflect: A compassionate, deeply reassuring perspective shift.
5. sparkMicroAction: A specific, effortless 60-to-120-second physical or mental action to unlock momentum immediately.
6. affirmation: A clean, grounded one-line mantra (no cheese, pure quiet strength).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quoteOrWisdom: { type: Type.STRING },
            author: { type: Type.STRING },
            philosophicalContext: { type: Type.STRING },
            groundedReflect: { type: Type.STRING },
            sparkMicroAction: { type: Type.STRING },
            affirmation: { type: Type.STRING },
          },
          required: ['quoteOrWisdom', 'author', 'philosophicalContext', 'groundedReflect', 'sparkMicroAction', 'affirmation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating inspiration spark:', err);
    return res.json({
      quoteOrWisdom: 'The impediment to action advances action. What stands in the way becomes the way.',
      author: 'Marcus Aurelius',
      philosophicalContext: 'Resistance is not a sign that you are broken or incapable; it is simply the natural friction of doing something that matters.',
      groundedReflect: 'Let go of demanding that the work feel easy. Embrace the slight stretch, knowing that courage is built in this exact moment.',
      sparkMicroAction: 'Open the first file or tool, write one single imperfect sentence, and let momentum take over.',
      affirmation: 'I meet resistance with curiosity, not avoidance.',
    });
  }
});

// POST /api/coach-chat - AI Career & Accountability Mentor
app.post('/api/coach-chat', async (req: Request, res: Response) => {
  try {
    const { messages, careerContext, activeContract } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array required.' });
    }

    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.text || '';
      return res.json({
        reply: `I hear you loud and clear. When you say "${lastUserMsg.slice(0, 40)}...", remember: progress is built by the unhurried consistency of ordinary days. Let's look at your active commitment: what is the single atomic action you can take right now in the next 120 seconds? Take a breath, close extra browser tabs, and start.`,
      });
    }

    const contextSummary = careerContext
      ? `User Level: ${careerContext.level} (${careerContext.title}), Streak: ${careerContext.streakDays} days, Upskill Minutes: ${careerContext.totalUpskillMinutes}m.`
      : '';

    const contractSummary = activeContract && activeContract.status === 'active'
      ? `Active Accountability Stake: Task "${activeContract.task}" due by "${activeContract.deadline}". Reward: "${activeContract.reward}". Forfeit/Punishment: "${activeContract.forfeit}".`
      : 'No active forfeit contract currently pending.';

    const systemPrompt = `You are AuraMentor: an elite, compassionate yet firm Executive Clarity, Career Coach, and Accountability Partner.
The user opens this app when they feel demotivated, need to upskill, advance their career, or execute daily tasks without distraction.

Your style:
1. Grounded & Direct: Never use hollow cheerleading or corporate buzzwords. Speak with warmth, psychological depth, and calm authority.
2. Accountability Enforcer: If the user makes excuses or procrastinates, gently call them out and redirect them to a 2-minute starting threshold. Remind them of their active accountability stakes if relevant.
3. Career Strategist: Guide them on high-leverage upskilling, deep work habits, avoiding burnout, and climbing their career ladder.
4. Always end with a crisp, low-friction micro-question or immediate next step (under 2 minutes).

User State Context:
${contextSummary}
${contractSummary}`;

    // Convert messages to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I am with you. What is the single step we are taking right now?';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Error in coach-chat:', err);
    return res.json({
      reply: 'Remember: action precedes motivation. Take a deep breath, pick your single priority for the next 10 minutes, and let us build momentum together.',
    });
  }
});

// POST /api/align-career - Hierarchical Career Alignment & Daily Task Compliance Audit
app.post('/api/align-career', async (req: Request, res: Response) => {
  try {
    const { lifeGoal, oneYearPlan, tasks, rawThoughts } = req.body;

    if (!ai) {
      return res.json({
        lifeGoalRefinement: lifeGoal || 'Master your craft with deep focus and build high-leverage products that grant autonomy.',
        oneYearMilestones: [
          'Acquire core senior-level technical and architectural competence',
          'Ship 2 end-to-end production projects with real users',
          'Establish a disciplined 90-minute daily deep work habit',
        ],
        taskCompliance: (tasks || []).map((t: any, i: number) => ({
          taskId: t.id,
          taskTitle: t.title,
          alignmentTier: i === 0 ? 'aligned_core' : i === 1 ? 'maintenance' : 'drift',
          alignedWithGoal: i === 0 ? 'Directly advances 1-Year Technical Mastery' : 'Operational upkeep',
          complianceScore: i === 0 ? 95 : i === 1 ? 70 : 35,
          coachingNote: i === 0 ? 'Protect your morning focus block for this task.' : 'Limit time spent here to avoid fake productivity.',
        })),
        alignmentScorePercent: 78,
        strategicInsight: 'Your day has strong potential, but make sure non-essential maintenance tasks do not displace your core 1-year upskilling sprint before noon.',
      });
    }

    const prompt = `Perform an executive Career Alignment Audit linking Long-Term Life Vision -> 1-Year Milestones -> Today's Daily Tasks.

Context:
- Life Vision / Ultimate Craft Goal: "${lifeGoal || 'Not yet defined - infer from thoughts'}"
- 1-Year Career Plan: "${oneYearPlan || 'Not yet defined - infer from thoughts'}"
- Raw Thoughts/Aspirations: "${rawThoughts || ''}"
- Today's Proposed Tasks: ${JSON.stringify(tasks || [])}

Analyze whether the day-to-day tasks COMPLY with the 1-Year Career Plan and Life Goal, or whether the user is falling into "Productive Procrastination" (busywork that feels productive but changes nothing long-term).

Return JSON with:
1. lifeGoalRefinement: A clear, inspiring 1-2 sentence statement of the pinnacle career/life vision.
2. oneYearMilestones: Array of 3 concrete, measurable 1-year pillars.
3. taskCompliance: Array for each task with:
   - taskId
   - taskTitle
   - alignmentTier: 'aligned_core' (directly moves the 1-year needle) | 'maintenance' (necessary life duty) | 'drift' (busywork/distraction disguised as work)
   - alignedWithGoal: specific explanation of how it serves or fails the 1-year goal
   - complianceScore: 0 to 100
   - coachingNote: 1 sentence on whether to prioritize, timebox, or drop
4. alignmentScorePercent: 0 to 100 overall alignment of today's schedule
5. strategicInsight: 2 sentences of executive coaching on how to align today's energy with the 1-year horizon.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lifeGoalRefinement: { type: Type.STRING },
            oneYearMilestones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            taskCompliance: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  taskTitle: { type: Type.STRING },
                  alignmentTier: { type: Type.STRING, enum: ['aligned_core', 'maintenance', 'drift'] },
                  alignedWithGoal: { type: Type.STRING },
                  complianceScore: { type: Type.INTEGER },
                  coachingNote: { type: Type.STRING },
                },
                required: ['taskId', 'taskTitle', 'alignmentTier', 'alignedWithGoal', 'complianceScore', 'coachingNote'],
              },
            },
            alignmentScorePercent: { type: Type.INTEGER },
            strategicInsight: { type: Type.STRING },
          },
          required: ['lifeGoalRefinement', 'oneYearMilestones', 'taskCompliance', 'alignmentScorePercent', 'strategicInsight'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in align-career:', err);
    return res.json({
      lifeGoalRefinement: req.body.lifeGoal || 'Achieve craft mastery and professional autonomy through consistent high-leverage execution.',
      oneYearMilestones: ['Complete key technical certification or project', 'Build a portfolio of 3 substantial outcomes', 'Sustain 15-minute daily upskilling habit'],
      taskCompliance: (req.body.tasks || []).map((t: any, i: number) => ({
        taskId: t.id,
        taskTitle: t.title,
        alignmentTier: i === 0 ? 'aligned_core' : 'maintenance',
        alignedWithGoal: i === 0 ? 'Advances primary craft' : 'Daily operational duty',
        complianceScore: i === 0 ? 90 : 65,
        coachingNote: 'Ensure the top task gets uninterrupted morning focus.',
      })),
      alignmentScorePercent: 80,
      strategicInsight: 'Focus on your core aligned milestone first before tending to administrative maintenance.',
    });
  }
});

// Vite Middleware integration in development vs static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraMind server running on port ${PORT}`);
  });
}

startServer();
