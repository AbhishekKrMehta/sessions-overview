import { Session } from './session.model';

const CHARGER_NAMES = [
  'Alpha-01', 'Alpha-02', 'Alpha-03', 'Alpha-04',
  'Beta-01', 'Beta-02', 'Beta-03', 'Beta-04',
  'Gamma-01', 'Gamma-02', 'Gamma-03', 'Gamma-04',
  'Delta-01', 'Delta-02', 'Delta-03', 'Delta-04',
  'Epsilon-01', 'Epsilon-02', 'Epsilon-03', 'Epsilon-04',
];

const LOCATIONS = [
  'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven',
  'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen',
];

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Lucas', 'Mia', 'Sofia', 'Daan', 'Sem',
  'Thijs', 'Jesse', 'Finn', 'Luuk', 'Bram', 'Milan', 'Tim', 'Max', 'Ruben', 'Levi',
  'Isa', 'Saar', 'Tess', 'Lara', 'Julia', 'Fleur', 'Noor', 'Sanne', 'Evi', 'Anna',
  'Hugo', 'Elias', 'Jens', 'Koen', 'Pim', 'Niels', 'Sven', 'Teun', 'Mats', 'Jasper',
  'Tom', 'Rick', 'Joris', 'Wout', 'Kees', 'Bart', 'Chris', 'Sander', 'Stijn', 'Merel',
];

const LAST_NAMES = [
  'Jansen', 'De Vries', 'Van den Berg', 'Bakker', 'Visser', 'Smit', 'Meijer', 'De Boer', 'Mulder', 'De Groot',
  'Bos', 'Vos', 'Peters', 'Hendriks', 'Van Leeuwen', 'Dekker', 'Brouwer', 'De Wit', 'Dijkstra', 'Smits',
  'De Graaf', 'Van der Meer', 'Van der Linden', 'Kok', 'Jacobs', 'De Jong', 'Prins', 'Huisman', 'Peeters', 'Kuipers',
  'Van Dijk', 'Hermans', 'Van Beek', 'Willems', 'Van der Wal', 'Koster', 'Schouten', 'Van der Heijden', 'Post', 'Bosch',
  'Maas', 'Martens', 'Koning', 'Van der Veen', 'Kroon', 'De Ruiter', 'Veldkamp', 'Scholten', 'Timmermans', 'Kroes',
];

const USERS: string[] = FIRST_NAMES.map((fn, i) => `${fn} ${LAST_NAMES[i]}`);

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function uuidLike(rand: () => number): string {
  const hex = () => Math.floor(rand() * 16).toString(16);
  let out = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) out += '-';
    out += hex();
  }
  return out;
}

function generateSessions(): Session[] {
  const rand = mulberry32(42);
  const anchor = new Date('2026-04-23T12:00:00Z').getTime();
  const day = 24 * 60 * 60 * 1000;
  const sessions: Session[] = [];

  for (let i = 0; i < 1000; i++) {
    const statusRoll = rand();
    let status: Session['status'];
    if (statusRoll < 0.70) status = 'Completed';
    else if (statusRoll < 0.85) status = 'Active';
    else if (statusRoll < 0.95) status = 'Failed';
    else status = 'Cancelled';

    const daysAgo = rand() * 180;
    const startedAt = new Date(anchor - daysAgo * day);

    const durationMinutes = Math.floor(5 + rand() * 475);
    const energyKwh = Math.round((0.5 + rand() * 119.5) * 100) / 100;
    const costEur = Math.round((0.1 + rand() * 79.9) * 100) / 100;

    sessions.push({
      id: uuidLike(rand),
      chargerName: CHARGER_NAMES[Math.floor(rand() * CHARGER_NAMES.length)],
      chargerLocation: LOCATIONS[Math.floor(rand() * LOCATIONS.length)],
      status,
      startedAt,
      durationMinutes,
      energyKwh,
      costEur,
      user: USERS[Math.floor(rand() * USERS.length)],
    });
  }

  return sessions;
}

export const MOCK_SESSIONS: Session[] = generateSessions();
