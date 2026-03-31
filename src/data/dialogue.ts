export const DIALOGUE = {
  greetings: [
    'Welcome to the forest!',
    'Ready for an adventure?',
    'The forest awaits!',
    "Let's explore and learn!",
    'What will we find today?',
  ],
  correct: [
    'Wonderful!',
    "That's right!",
    "You're so smart!",
    'Great job!',
    'Perfect!',
    'Amazing work!',
    'You got it!',
    'Brilliant!',
  ],
  incorrect: [
    'Almost! Try the next one.',
    'Good try!',
    "You're learning!",
    "That's okay, keep going!",
    'Nice effort!',
    "Don't worry, you'll get it!",
  ],
  levelUp: [
    "You did it! New level unlocked!",
    "Amazing! You're moving up!",
    "Wow, you mastered it!",
  ],
  encouragement: [
    'The forest believes in you!',
    'Keep exploring!',
    "You're a forest champion!",
    'Almost there, adventurer!',
    "I believe in you!",
  ],
  streakMessages: [
    "You've practiced {n} days in a row!",
    '{n}-day streak! Amazing!',
    'Wow, {n} days! Keep it up!',
  ],
  sessionStart: {
    counting: "Let's count forest friends!",
    number_recognition: "Can you find the right number?",
    sequencing: "What number comes next?",
    comparison: 'Which group has more?',
    addition: "Let's add up our forest treasures!",
    subtraction: "Some friends flew away! How many are left?",
    pattern: 'Can you complete the pattern?',
  },
};

export function getRandomDialogue(category: keyof typeof DIALOGUE): string {
  const messages = DIALOGUE[category];
  if (Array.isArray(messages)) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  return '';
}

export function getStreakMessage(days: number): string {
  const template = DIALOGUE.streakMessages[Math.floor(Math.random() * DIALOGUE.streakMessages.length)];
  return template.replace('{n}', String(days));
}
