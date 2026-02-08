// Gaming username generator utility
export interface UsernameOptions {
  includeNumbers?: boolean;
  includeSpecialChars?: boolean;
  minLength?: number;
  maxLength?: number;
  theme?: 'cyber' | 'fantasy' | 'space' | 'nature' | 'tech' | 'random';
}

const themes = {
  cyber: {
    adjectives: [
      'Cyber', 'Neon', 'Digital', 'Binary', 'Neural', 'Quantum', 'Virtual', 'Matrix',
      'Pixel', 'Code', 'Data', 'Sync', 'Hack', 'Glitch', 'Chrome', 'Steel'
    ],
    nouns: [
      'Runner', 'Ghost', 'Phantom', 'Shadow', 'Blade', 'Wire', 'Core', 'Node',
      'Nexus', 'Pulse', 'Stream', 'Circuit', 'Byte', 'Spark', 'Edge', 'Link'
    ]
  },
  fantasy: {
    adjectives: [
      'Ancient', 'Mystic', 'Dark', 'Light', 'Fire', 'Ice', 'Storm', 'Shadow',
      'Golden', 'Silver', 'Crimson', 'Azure', 'Emerald', 'Royal', 'Noble', 'Wild'
    ],
    nouns: [
      'Dragon', 'Phoenix', 'Griffin', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Bear',
      'Wizard', 'Knight', 'Mage', 'Warrior', 'Hunter', 'Ranger', 'Paladin', 'Rogue'
    ]
  },
  space: {
    adjectives: [
      'Cosmic', 'Stellar', 'Galactic', 'Solar', 'Lunar', 'Astro', 'Nova', 'Nebula',
      'Void', 'Plasma', 'Quantum', 'Orbital', 'Celestial', 'Infinite', 'Zero', 'Alpha'
    ],
    nouns: [
      'Explorer', 'Voyager', 'Pilot', 'Commander', 'Captain', 'Navigator', 'Scout', 'Guardian',
      'Star', 'Comet', 'Meteor', 'Satellite', 'Station', 'Ship', 'Cruiser', 'Fighter'
    ]
  },
  nature: {
    adjectives: [
      'Wild', 'Forest', 'Mountain', 'River', 'Ocean', 'Desert', 'Arctic', 'Jungle',
      'Thunder', 'Lightning', 'Wind', 'Earth', 'Stone', 'Crystal', 'Jade', 'Amber'
    ],
    nouns: [
      'Wolf', 'Eagle', 'Bear', 'Fox', 'Hawk', 'Owl', 'Deer', 'Panther',
      'Tree', 'Rock', 'Stream', 'Valley', 'Peak', 'Grove', 'Meadow', 'Canyon'
    ]
  },
  tech: {
    adjectives: [
      'Smart', 'Auto', 'Turbo', 'Ultra', 'Super', 'Mega', 'Giga', 'Tera',
      'Fast', 'Quick', 'Rapid', 'Swift', 'Instant', 'Direct', 'Prime', 'Max'
    ],
    nouns: [
      'Bot', 'AI', 'System', 'Engine', 'Core', 'Hub', 'Lab', 'Tech',
      'Dev', 'Code', 'App', 'Web', 'Net', 'Cloud', 'Server', 'Database'
    ]
  }
};

const specialChars = ['_', '-', '.'];
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const generateUsername = (options: UsernameOptions = {}): string => {
  const {
    includeNumbers = true,
    includeSpecialChars = false,
    minLength = 6,
    maxLength = 20,
    theme = 'random'
  } = options;

  // Select theme
  const selectedTheme = theme === 'random' 
    ? Object.keys(themes)[Math.floor(Math.random() * Object.keys(themes).length)] as keyof typeof themes
    : theme;

  const themeData = themes[selectedTheme];
  
  // Generate base username
  const adjective = themeData.adjectives[Math.floor(Math.random() * themeData.adjectives.length)];
  const noun = themeData.nouns[Math.floor(Math.random() * themeData.nouns.length)];
  
  let username = adjective + noun;
  
  // Add numbers if requested
  if (includeNumbers) {
    const numCount = Math.floor(Math.random() * 3) + 1; // 1-3 numbers
    for (let i = 0; i < numCount; i++) {
      username += numbers[Math.floor(Math.random() * numbers.length)];
    }
  }
  
  // Add special characters if requested
  if (includeSpecialChars && Math.random() > 0.5) {
    const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    const position = Math.floor(Math.random() * (username.length - 1)) + 1;
    username = username.slice(0, position) + specialChar + username.slice(position);
  }
  
  // Ensure length constraints
  if (username.length < minLength) {
    while (username.length < minLength) {
      if (includeNumbers) {
        username += numbers[Math.floor(Math.random() * numbers.length)];
      } else {
        username += 'X';
      }
    }
  }
  
  if (username.length > maxLength) {
    username = username.substring(0, maxLength);
  }
  
  return username;
};

export const generateMultipleUsernames = (count: number = 5, options: UsernameOptions = {}): string[] => {
  const usernames: string[] = [];
  const usedUsernames = new Set<string>();
  
  while (usernames.length < count) {
    const username = generateUsername(options);
    if (!usedUsernames.has(username)) {
      usernames.push(username);
      usedUsernames.add(username);
    }
  }
  
  return usernames;
};

export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Length check
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  if (username.length > 20) {
    errors.push('Username must be no more than 20 characters long');
  }
  
  // Character check
  const validChars = /^[a-zA-Z0-9_.-]+$/;
  if (!validChars.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, hyphens, and periods');
  }
  
  // Start/end check
  if (username.startsWith('_') || username.startsWith('-') || username.startsWith('.')) {
    errors.push('Username cannot start with special characters');
  }
  if (username.endsWith('_') || username.endsWith('-') || username.endsWith('.')) {
    errors.push('Username cannot end with special characters');
  }
  
  // Consecutive special chars
  if (/[_.-]{2,}/.test(username)) {
    errors.push('Username cannot have consecutive special characters');
  }
  
  // Reserved words
  const reservedWords = ['admin', 'root', 'user', 'test', 'null', 'undefined', 'system', 'api'];
  if (reservedWords.includes(username.toLowerCase())) {
    errors.push('This username is reserved and cannot be used');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `GG_${timestamp}_${randomStr}`.toUpperCase();
};

export const formatDisplayName = (firstName: string, lastName: string, username: string): string => {
  return `${firstName} ${lastName} (@${username})`;
};

export const getAvatarInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};