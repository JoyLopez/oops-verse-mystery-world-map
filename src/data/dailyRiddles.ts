export interface LogicRiddle {
  id: string;
  title: string;
  category: 'Deductive Logic' | 'Cipher Decryption' | 'Alibi Analysis' | 'Sequence Breakdown' | 'Witness Cross-Check';
  icon: string;
  question: string;
  scenarioText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  rewardCoins: number;
  rewardXp: number;
}

export const DAILY_RIDDLES: LogicRiddle[] = [
  {
    id: 'riddle_01',
    title: 'The Silent Clockmaker',
    category: 'Alibi Analysis',
    icon: '🕰️',
    scenarioText: 'A high-stakes antique clock was stolen from the gallery between 2:00 PM and 3:00 PM. Four suspects gave their alibis.',
    question: 'Which suspect’s statement contains an immediate logical contradiction?',
    options: [
      'Suspect A: "I was listening to the live hourly chime on the radio at 2:30 PM in my soundproof basement."',
      'Suspect B: "I was buying coffee at 2:15 PM and kept my printed receipt."',
      'Suspect C: "I was in a movie theater from 1:30 PM to 3:30 PM with my phone silenced."',
      'Suspect D: "I was waiting for a delayed train at the central platform until 2:45 PM."',
    ],
    correctAnswerIndex: 0,
    explanation: 'A soundproof basement would block radio signals unless an external antenna was specifically mentioned, but more importantly, radio stations broadcast chimes on the top of the hour (3:00 PM), not at 2:30 PM!',
    hint: 'Pay close attention to time conventions and radio broadcast traditions for hourly chimes.',
    rewardCoins: 150,
    rewardXp: 200,
  },
  {
    id: 'riddle_02',
    title: 'The Mirror Cipher',
    category: 'Cipher Decryption',
    icon: '🪞',
    scenarioText: 'A scrawled note found at the crime scene reads: "EHT TEACUS AI SLLAW."',
    question: 'Decipher the hidden location keyword hidden in reverse word order.',
    options: [
      'THE STATUE AT WALLS',
      'THE CAUSE IS WALLS',
      'THE SAUCER IN WALLS',
      'THE SECRET IS WALLS',
    ],
    correctAnswerIndex: 0,
    explanation: 'Reversing each individual word: "EHT" -> "THE", "TEACUS" -> "STATUE" (approx / mirror swap), "AI" -> "AT", "SLLAW" -> "WALLS": "THE STATUE AT WALLS".',
    hint: 'Try spelling each word backwards from right to left.',
    rewardCoins: 150,
    rewardXp: 200,
  },
  {
    id: 'riddle_03',
    title: 'The Poisoned Toast',
    category: 'Deductive Logic',
    icon: '🍷',
    scenarioText: 'Two diplomats drank iced tea from the same pitcher. Diplomat X drank five glasses quickly in two minutes. Diplomat Y sipped only one glass slowly over thirty minutes. Only Diplomat Y died of poison.',
    question: 'Where was the deadly toxin hidden?',
    options: [
      'In the pitcher’s glass handle',
      'In the ice cubes',
      'On the rim of Diplomat Y’s glass',
      'In the tea leaves at the bottom',
    ],
    correctAnswerIndex: 1,
    explanation: 'The poison was frozen inside the ice cubes! Diplomat X drank so fast that the ice didn’t have time to melt. Diplomat Y drank slowly, allowing the ice to melt and release the toxin.',
    hint: 'Consider how time and temperature affect the physical state of drinks.',
    rewardCoins: 150,
    rewardXp: 200,
  },
  {
    id: 'riddle_04',
    title: 'The Rainless Footsteps',
    category: 'Alibi Analysis',
    icon: '🌧️',
    scenarioText: 'A heavy rainstorm began at 4:00 PM and stopped at 5:00 PM. A burglary occurred inside a mansion. The detective observed muddy, wet footprints entering the foyer, but dry, clean floor tiles leaving towards the back exit.',
    question: 'What can be deduced about the suspect?',
    options: [
      'The suspect entered during the rainstorm and exited long after the ground dried',
      'The suspect took off their shoes inside',
      'The suspect walked backwards',
      'The burglar entered before 4:00 PM',
    ],
    correctAnswerIndex: 0,
    explanation: 'Muddy wet footprints going in mean they arrived while it was wet/raining, but clean dry tiles leaving indicate they left after the mud dried off or hours later.',
    hint: 'Compare the state of incoming versus outgoing tracks relative to time and moisture.',
    rewardCoins: 150,
    rewardXp: 200,
  },
  {
    id: 'riddle_05',
    title: 'The Three Safe Combination',
    category: 'Sequence Breakdown',
    icon: '🔐',
    scenarioText: 'The vault code follows a strict logic sequence: 2, 6, 12, 20, 30, ?',
    question: 'What is the final digit to unlock the master safe vault?',
    options: ['38', '40', '42', '46'],
    correctAnswerIndex: 2,
    explanation: 'The differences between consecutive numbers are +4, +6, +8, +10. The next increment is +12, making 30 + 12 = 42 (or n*(n+1): 1x2=2, 2x3=6, 3x4=12, 4x5=20, 5x6=30, 6x7=42).',
    hint: 'Look at the gaps between numbers: +4, +6, +8...',
    rewardCoins: 150,
    rewardXp: 200,
  },
  {
    id: 'riddle_06',
    title: 'The Four Liars Protocol',
    category: 'Witness Cross-Check',
    icon: '🗣️',
    scenarioText: 'Exactly one suspect is telling the truth. Suspect A says "B did it." Suspect B says "D did it." Suspect C says "I didn\'t do it." Suspect D says "B is lying."',
    question: 'Who is the true culprit?',
    options: ['Suspect A', 'Suspect B', 'Suspect C', 'Suspect D'],
    correctAnswerIndex: 2,
    explanation: 'If C is the culprit, then C is lying ("I didn\'t do it" is false). A says "B did it" (false). B says "D did it" (false). D says "B is lying" (TRUE!). Exactly ONE person (D) tells the truth! Therefore C is guilty.',
    hint: 'Test each suspect as the guilty party and count how many true statements result.',
    rewardCoins: 175,
    rewardXp: 220,
  },
  {
    id: 'riddle_07',
    title: 'The Frozen Window Mystery',
    category: 'Deductive Logic',
    icon: '❄️',
    scenarioText: 'On a freezing winter night, a man claims he was outside when he saw a burglar inside his house through a heavily frosted glass window. He claims he breathed on the outside glass to melt the frost and watch the break-in.',
    question: 'Why did Detective Sam arrest the man on the spot for filing a false report?',
    options: [
      'Frost accumulates on the inside of heated house windows, not the outside',
      'Breathing on frozen glass instantly cracks it',
      'Frosted glass is always tinted black',
      'Burglars always turn off all lights',
    ],
    correctAnswerIndex: 0,
    explanation: 'Frost forms on the inside of glass windows because warm moist air inside the house hits the cold pane. Breathing on the outside would not melt inner frost!',
    hint: 'Think about where warm air meets cold glass in a heated building.',
    rewardCoins: 150,
    rewardXp: 200,
  },
  {
    id: 'riddle_08',
    title: 'The Red Herring Note',
    category: 'Cipher Decryption',
    icon: '📜',
    scenarioText: 'A ransom note contains a pattern where taking the FIRST letter of every word spells the drop location: "Find Our Underground Red Fountain Outside North Station."',
    question: 'Where is the contraband hidden?',
    options: [
      'F-O-U-R-F-O-N-S (FOUR FONS)',
      'F-O-U-R-F-O-R-T (FOUR FORT)',
      'F-O-U-R-F-O-U-N-S (FOUR FOUNS)',
      'N-O-R-T-H S-T-A-T-I-O-N',
    ],
    correctAnswerIndex: 0,
    explanation: 'First letters: F-i-n-d (F), O-u-r (O), U-n-d-e-r-g-r-o-u-n-d (U), R-e-d (R), F-o-u-n-t-a-i-n (F), O-u-t-s-i-d-e (O), N-o-r-t-h (N), S-t-a-t-i-o-n (S) -> FOUR FONS.',
    hint: 'Extract the initial letter of each word in order.',
    rewardCoins: 150,
    rewardXp: 200,
  },
  {
    id: 'riddle_09',
    title: 'The Elevator Slip',
    category: 'Alibi Analysis',
    icon: '🛗',
    scenarioText: 'A suspect claims they took the high-speed express elevator from the 50th floor down to the lobby without stopping, taking 15 minutes because of heavy elevator traffic.',
    question: 'Why is this alibi suspicious?',
    options: [
      'Express elevators take less than 1 minute even with stops; 15 minutes indicates stairs or delayed activity',
      'Elevators don\'t work above 30 floors',
      'Lobbies are always on the top floor',
      'High speed elevators require fingerprint clearance',
    ],
    correctAnswerIndex: 0,
    explanation: 'Modern express elevators travel at high speeds (often 30-45 seconds for 50 floors). Taking 15 minutes means the suspect was likely engaged elsewhere during that timeframe.',
    hint: 'Consider realistic mechanical travel times versus human activity delays.',
    rewardCoins: 150,
    rewardXp: 200,
  },
  {
    id: 'riddle_10',
    title: 'The Weightless Evidence',
    category: 'Deductive Logic',
    icon: '⚖️',
    scenarioText: 'You have 9 gold coins. One is a counterfeit that is slightly lighter than the rest. You have a balance scale.',
    question: 'What is the MINIMUM number of weighings required to guarantee finding the fake coin?',
    options: ['1 weighing', '2 weighings', '3 weighings', '4 weighings'],
    correctAnswerIndex: 1,
    explanation: 'Divide into 3 groups of 3 (A, B, C). Weigh A vs B. If equal, fake is in C; if unequal, fake is in the lighter group. Then weigh 2 coins from the target group of 3 (1 vs 1). Total 2 weighings guaranteed!',
    hint: 'Group the 9 coins into 3 sets of 3.',
    rewardCoins: 200,
    rewardXp: 250,
  },
];

export function getTodayRiddleDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodayRiddle(): LogicRiddle {
  const dateStr = getTodayRiddleDateString();
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash += dateStr.charCodeAt(i) * (i + 1);
  }
  const index = hash % DAILY_RIDDLES.length;
  return DAILY_RIDDLES[index];
}
