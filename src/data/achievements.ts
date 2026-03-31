import type { Achievement } from '@/types/game-types';

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  { id: 'first_correct', name: 'First Steps', description: 'Answer your first question correctly!', icon: 'badge-first', requirement: { type: 'first_correct', value: 1 } },
  { id: 'level_7a', name: 'Counter Master', description: 'Complete Level 7A', icon: 'badge-7a', requirement: { type: 'level_complete', value: '7A' } },
  { id: 'level_6a', name: 'Number Explorer', description: 'Complete Level 6A', icon: 'badge-6a', requirement: { type: 'level_complete', value: '6A' } },
  { id: 'level_5a', name: 'Sequence Star', description: 'Complete Level 5A', icon: 'badge-5a', requirement: { type: 'level_complete', value: '5A' } },
  { id: 'level_4a', name: 'Pattern Detective', description: 'Complete Level 4A', icon: 'badge-4a', requirement: { type: 'level_complete', value: '4A' } },
  { id: 'level_3a', name: 'Addition Expert', description: 'Complete Level 3A', icon: 'badge-3a', requirement: { type: 'level_complete', value: '3A' } },
  { id: 'level_2a', name: 'Math Champion', description: 'Complete Level 2A', icon: 'badge-2a', requirement: { type: 'level_complete', value: '2A' } },
  { id: 'perfect_score', name: 'Perfect Score', description: 'Get 100% on any session', icon: 'badge-perfect', requirement: { type: 'perfect_score', value: 100 } },
  { id: 'speed_star', name: 'Speed Star', description: 'Finish a session under target time', icon: 'badge-speed', requirement: { type: 'sessions', value: 0 } },
  { id: 'streak_3', name: '3-Day Streak', description: 'Practice 3 days in a row!', icon: 'badge-streak3', requirement: { type: 'streak', value: 3 } },
  { id: 'streak_7', name: '7-Day Streak', description: 'Practice a whole week!', icon: 'badge-streak7', requirement: { type: 'streak', value: 7 } },
  { id: 'streak_30', name: '30-Day Streak', description: 'A month of learning!', icon: 'badge-streak30', requirement: { type: 'streak', value: 30 } },
  { id: 'stars_100', name: 'Star Collector', description: 'Earn 100 stars', icon: 'badge-stars100', requirement: { type: 'stars', value: 100 } },
  { id: 'stars_500', name: 'Star Master', description: 'Earn 500 stars', icon: 'badge-stars500', requirement: { type: 'stars', value: 500 } },
  { id: 'stars_1000', name: 'Superstar', description: 'Earn 1000 stars!', icon: 'badge-stars1000', requirement: { type: 'stars', value: 1000 } },
  { id: 'sessions_10', name: 'Dedicated Learner', description: 'Complete 10 sessions', icon: 'badge-sessions10', requirement: { type: 'sessions', value: 10 } },
  { id: 'sessions_50', name: 'Math Enthusiast', description: 'Complete 50 sessions', icon: 'badge-sessions50', requirement: { type: 'sessions', value: 50 } },
];
