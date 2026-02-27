export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type Goal =
  | 'weight-loss'
  | 'build-muscle'
  | 'improve-endurance'
  | 'increase-flexibility'
  | 'stress-relief'
  | 'general-fitness';

export type Equipment =
  | 'none'
  | 'dumbbells'
  | 'resistance-bands'
  | 'pull-up-bar'
  | 'kettlebell'
  | 'yoga-mat'
  | 'full-gym';

export type WorkoutType =
  | 'upper-body'
  | 'lower-body'
  | 'core'
  | 'full-body'
  | 'stretch';

export type CoachPersonality =
  | 'drill-sergeant'
  | 'hype-beast'
  | 'zen-master';

export type SessionDuration = 5 | 15 | 30;

export interface UserProfile {
  name: string;
  age: number;
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  equipment: Equipment[];
  preferredDuration: SessionDuration;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
  duration: number; // minutes
  intensity: 'light' | 'moderate' | 'high';
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: string; // "8-12" or "30 sec"
  rest?: string;
  notes?: string;
}

export interface WorkoutPlan {
  title: string;
  summary: string;
  weeklySchedule: WorkoutDay[];
  focusAreas: string[];
  tips: string[];
  firstSessionRecommendation: {
    workoutType: WorkoutType;
    personality: CoachPersonality;
    duration: SessionDuration;
    reason: string;
  };
}

export interface PersonaConfig {
  id: CoachPersonality;
  name: string;
  tagline: string;
  description: string;
  color: string;
  systemPrompt: string;
  context: string;
  visualAwarenessQueries: string[];
  audioAwarenessQueries: string[];
}

export interface ConversationRequest {
  workoutType: WorkoutType;
  coachPersonality: CoachPersonality;
  duration: SessionDuration;
  userName?: string;
}

export interface ConversationResponse {
  conversation_url: string;
  conversation_id: string;
}

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  'upper-body': 'Upper Body',
  'lower-body': 'Lower Body',
  'core': 'Core',
  'full-body': 'Full Body',
  'stretch': 'Stretch & Mobility',
};

export const COACH_LABELS: Record<CoachPersonality, string> = {
  'drill-sergeant': 'Drill Sergeant',
  'hype-beast': 'Hype Beast',
  'zen-master': 'Zen Master',
};

export const GOAL_LABELS: Record<Goal, string> = {
  'weight-loss': 'Weight Loss',
  'build-muscle': 'Build Muscle',
  'improve-endurance': 'Endurance',
  'increase-flexibility': 'Flexibility',
  'stress-relief': 'Stress Relief',
  'general-fitness': 'General Fitness',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  'none': 'No Equipment',
  'dumbbells': 'Dumbbells',
  'resistance-bands': 'Resistance Bands',
  'pull-up-bar': 'Pull-Up Bar',
  'kettlebell': 'Kettlebell',
  'yoga-mat': 'Yoga Mat',
  'full-gym': 'Full Gym Access',
};
