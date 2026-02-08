import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  RotateCcw, 
  Save, 
  Eye, 
  Shirt, 
  Crown, 
  Sparkles,
  Shuffle,
  Download,
  Upload
} from 'lucide-react';

interface CharacterCreatorProps {
  onSave: (characterData: CharacterData) => void;
  initialCharacter?: CharacterData;
  characterName: string;
  characterClass: string;
}

interface CharacterData {
  // Appearance
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  facialHair: string;
  
  // Clothing & Accessories
  outfit: string;
  accessory: string;
  weapon: string;
  
  // Class-specific items
  classItems: string[];
  
  // Pose & Expression
  pose: string;
  expression: string;
  
  // Background
  background: string;
  
  // Metadata
  characterClass: string;
  characterName: string;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  onSave,
  initialCharacter,
  characterName,
  characterClass
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [character, setCharacter] = useState<CharacterData>({
    skinTone: '#F4C2A1',
    hairStyle: 'short',
    hairColor: '#8B4513',
    eyeColor: '#4A90E2',
    facialHair: 'none',
    outfit: 'casual',
    accessory: 'none',
    weapon: 'none',
    classItems: [],
    pose: 'standing',
    expression: 'neutral',
    background: 'gradient',
    characterClass,
    characterName,
    ...initialCharacter
  });

  const [activeTab, setActiveTab] = useState('appearance');

  // Character customization options
  const customizationOptions = {
    skinTones: [
      '#F4C2A1', '#E8B896', '#D4A574', '#C89968', '#B8845C',
      '#A67C52', '#8B6F47', '#6D5B47', '#4A3C2A', '#2D1B0E'
    ],
    hairStyles: [
      { id: 'short', name: 'Short', preview: '👨' },
      { id: 'long', name: 'Long', preview: '👨‍🦱' },
      { id: 'curly', name: 'Curly', preview: '👨‍🦲' },
      { id: 'bald', name: 'Bald', preview: '👨‍🦲' },
      { id: 'ponytail', name: 'Ponytail', preview: '👱‍♂️' },
      { id: 'mohawk', name: 'Mohawk', preview: '🤘' }
    ],
    hairColors: [
      '#000000', '#2C1810', '#8B4513', '#D2691E', '#CD853F',
      '#F4A460', '#FFD700', '#FF6347', '#9370DB', '#00CED1'
    ],
    eyeColors: [
      '#4A90E2', '#50C878', '#8B4513', '#32CD32', '#FF6347',
      '#9370DB', '#FFD700', '#FF1493', '#00CED1', '#696969'
    ],
    facialHair: [
      { id: 'none', name: 'None' },
      { id: 'mustache', name: 'Mustache' },
      { id: 'beard', name: 'Beard' },
      { id: 'goatee', name: 'Goatee' },
      { id: 'full', name: 'Full Beard' }
    ],
    outfits: {
      WARRIOR: [
        { id: 'armor', name: 'Battle Armor', icon: '🛡️' },
        { id: 'chainmail', name: 'Chainmail', icon: '⚔️' },
        { id: 'plate', name: 'Plate Armor', icon: '🏰' },
        { id: 'casual', name: 'Casual', icon: '👕' }
      ],
      MAGE: [
        { id: 'robes', name: 'Mystic Robes', icon: '🔮' },
        { id: 'scholar', name: 'Scholar Outfit', icon: '📚' },
        { id: 'elemental', name: 'Elemental Garb', icon: '⚡' },
        { id: 'casual', name: 'Casual', icon: '👕' }
      ],
      ROGUE: [
        { id: 'stealth', name: 'Stealth Gear', icon: '🗡️' },
        { id: 'leather', name: 'Leather Armor', icon: '🦹' },
        { id: 'ninja', name: 'Ninja Outfit', icon: '🥷' },
        { id: 'casual', name: 'Casual', icon: '👕' }
      ],
      PALADIN: [
        { id: 'holy', name: 'Holy Armor', icon: '✨' },
        { id: 'ceremonial', name: 'Ceremonial', icon: '👑' },
        { id: 'guardian', name: 'Guardian Plate', icon: '🛡️' },
        { id: 'casual', name: 'Casual', icon: '👕' }
      ],
      ARCHER: [
        { id: 'ranger', name: 'Ranger Gear', icon: '🏹' },
        { id: 'hunter', name: 'Hunter Outfit', icon: '🎯' },
        { id: 'forest', name: 'Forest Garb', icon: '🌲' },
        { id: 'casual', name: 'Casual', icon: '👕' }
      ]
    },
    accessories: [
      { id: 'none', name: 'None', icon: '❌' },
      { id: 'glasses', name: 'Glasses', icon: '👓' },
      { id: 'hat', name: 'Hat', icon: '🎩' },
      { id: 'headband', name: 'Headband', icon: '🎀' },
      { id: 'earrings', name: 'Earrings', icon: '💎' },
      { id: 'necklace', name: 'Necklace', icon: '📿' }
    ],
    weapons: {
      WARRIOR: [
        { id: 'sword', name: 'Sword', icon: '⚔️' },
        { id: 'axe', name: 'Battle Axe', icon: '🪓' },
        { id: 'hammer', name: 'War Hammer', icon: '🔨' },
        { id: 'none', name: 'None', icon: '❌' }
      ],
      MAGE: [
        { id: 'staff', name: 'Magic Staff', icon: '🪄' },
        { id: 'wand', name: 'Wand', icon: '✨' },
        { id: 'orb', name: 'Crystal Orb', icon: '🔮' },
        { id: 'none', name: 'None', icon: '❌' }
      ],
      ROGUE: [
        { id: 'dagger', name: 'Dagger', icon: '🗡️' },
        { id: 'bow', name: 'Short Bow', icon: '🏹' },
        { id: 'throwing', name: 'Throwing Knives', icon: '🔪' },
        { id: 'none', name: 'None', icon: '❌' }
      ],
      PALADIN: [
        { id: 'holy_sword', name: 'Holy Sword', icon: '⚔️✨' },
        { id: 'mace', name: 'Sacred Mace', icon: '🔨' },
        { id: 'shield', name: 'Divine Shield', icon: '🛡️' },
        { id: 'none', name: 'None', icon: '❌' }
      ],
      ARCHER: [
        { id: 'longbow', name: 'Longbow', icon: '🏹' },
        { id: 'crossbow', name: 'Crossbow', icon: '🎯' },
        { id: 'compound', name: 'Compound Bow', icon: '🏹' },
        { id: 'none', name: 'None', icon: '❌' }
      ]
    },
    poses: [
      { id: 'standing', name: 'Standing', icon: '🧍' },
      { id: 'heroic', name: 'Heroic', icon: '🦸' },
      { id: 'action', name: 'Action', icon: '🤸' },
      { id: 'thinking', name: 'Thinking', icon: '🤔' },
      { id: 'confident', name: 'Confident', icon: '😎' }
    ],
    expressions: [
      { id: 'neutral', name: 'Neutral', icon: '😐' },
      { id: 'happy', name: 'Happy', icon: '😊' },
      { id: 'determined', name: 'Determined', icon: '😤' },
      { id: 'focused', name: 'Focused', icon: '🧐' },
      { id: 'confident', name: 'Confident', icon: '😏' },
      { id: 'friendly', name: 'Friendly', icon: '😄' }
    ],
    backgrounds: [
      { id: 'gradient', name: 'Gradient', preview: '🌈' },
      { id: 'city', name: 'Cyberpunk City', preview: '🏙️' },
      { id: 'forest', name: 'Mystical Forest', preview: '🌲' },
      { id: 'mountains', name: 'Epic Mountains', preview: '⛰️' },
      { id: 'space', name: 'Cosmic Space', preview: '🌌' },
      { id: 'dungeon', name: 'Dark Dungeon', preview: '🏰' }
    ]
  };

  // Draw character on canvas
  useEffect(() => {
    drawCharacter();
  }, [character]);

  const drawCharacter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx, canvas.width, canvas.height);
    
    // Draw character base
    drawCharacterBase(ctx, canvas.width, canvas.height);
    
    // Draw character details
    drawCharacterDetails(ctx, canvas.width, canvas.height);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    switch (character.background) {
      case 'city':
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        break;
      case 'forest':
        gradient.addColorStop(0, '#2d5016');
        gradient.addColorStop(1, '#0f2027');
        break;
      case 'mountains':
        gradient.addColorStop(0, '#4b79a1');
        gradient.addColorStop(1, '#283e51');
        break;
      case 'space':
        gradient.addColorStop(0, '#0c0c0c');
        gradient.addColorStop(1, '#1a1a2e');
        break;
      case 'dungeon':
        gradient.addColorStop(0, '#2c1810');
        gradient.addColorStop(1, '#0f0f0f');
        break;
      default:
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawCharacterBase = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw head
    ctx.fillStyle = character.skinTone;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 60, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw body
    ctx.fillRect(centerX - 25, centerY - 20, 50, 80);
    
    // Draw arms
    ctx.fillRect(centerX - 45, centerY - 10, 20, 60);
    ctx.fillRect(centerX + 25, centerY - 10, 20, 60);
    
    // Draw legs
    ctx.fillRect(centerX - 20, centerY + 60, 15, 60);
    ctx.fillRect(centerX + 5, centerY + 60, 15, 60);
  };

  const drawCharacterDetails = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw hair
    if (character.hairStyle !== 'bald') {
      ctx.fillStyle = character.hairColor;
      ctx.fillRect(centerX - 35, centerY - 95, 70, 30);
    }
    
    // Draw eyes
    ctx.fillStyle = character.eyeColor;
    ctx.beginPath();
    ctx.arc(centerX - 12, centerY - 65, 4, 0, Math.PI * 2);
    ctx.arc(centerX + 12, centerY - 65, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw outfit indicator
    ctx.fillStyle = getOutfitColor();
    ctx.fillRect(centerX - 25, centerY - 20, 50, 80);
    
    // Add class symbol
    ctx.fillStyle = '#FFD700';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getClassSymbol(), centerX, centerY + 100);
  };

  const getOutfitColor = () => {
    const colors = {
      armor: '#C0C0C0',
      robes: '#4B0082',
      stealth: '#2F4F4F',
      holy: '#FFD700',
      ranger: '#228B22',
      casual: '#4169E1'
    };
    return colors[character.outfit as keyof typeof colors] || '#4169E1';
  };

  const getClassSymbol = () => {
    const symbols = {
      WARRIOR: '⚔️',
      MAGE: '🔮',
      ROGUE: '🗡️',
      PALADIN: '✨',
      ARCHER: '🏹'
    };
    return symbols[character.characterClass as keyof typeof symbols] || '⚔️';
  };

  const randomizeCharacter = () => {
    const randomSkinTone = customizationOptions.skinTones[Math.floor(Math.random() * customizationOptions.skinTones.length)];
    const randomHairStyle = customizationOptions.hairStyles[Math.floor(Math.random() * customizationOptions.hairStyles.length)];
    const randomHairColor = customizationOptions.hairColors[Math.floor(Math.random() * customizationOptions.hairColors.length)];
    const randomEyeColor = customizationOptions.eyeColors[Math.floor(Math.random() * customizationOptions.eyeColors.length)];
    const randomExpression = customizationOptions.expressions[Math.floor(Math.random() * customizationOptions.expressions.length)];
    
    setCharacter({
      ...character,
      skinTone: randomSkinTone,
      hairStyle: randomHairStyle.id,
      hairColor: randomHairColor,
      eyeColor: randomEyeColor,
      expression: randomExpression.id
    });
  };

  const exportCharacter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${characterName}_character.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: Eye },
    { id: 'clothing', name: 'Clothing', icon: Shirt },
    { id: 'accessories', name: 'Accessories', icon: Crown },
    { id: 'background', name: 'Background', icon: Palette }
  ];

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      {/* Skin Tone */}
      <div>
        <label className="block text-white font-medium mb-3">Skin Tone</label>
        <div className="flex flex-wrap gap-2">
          {customizationOptions.skinTones.map((tone) => (
            <button
              key={tone}
              onClick={() => setCharacter({ ...character, skinTone: tone })}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                character.skinTone === tone ? 'border-white scale-110' : 'border-slate-600'
              }`}
              style={{ backgroundColor: tone }}
            />
          ))}
        </div>
      </div>

      {/* Hair Style */}
      <div>
        <label className="block text-white font-medium mb-3">Hair Style</label>
        <div className="grid grid-cols-3 gap-2">
          {customizationOptions.hairStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setCharacter({ ...character, hairStyle: style.id })}
              className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                character.hairStyle === style.id 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">{style.preview}</div>
              <div className="text-xs text-white">{style.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Hair Color */}
      <div>
        <label className="block text-white font-medium mb-3">Hair Color</label>
        <div className="flex flex-wrap gap-2">
          {customizationOptions.hairColors.map((color) => (
            <button
              key={color}
              onClick={() => setCharacter({ ...character, hairColor: color })}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                character.hairColor === color ? 'border-white scale-110' : 'border-slate-600'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Eye Color */}
      <div>
        <label className="block text-white font-medium mb-3">Eye Color</label>
        <div className="flex flex-wrap gap-2">
          {customizationOptions.eyeColors.map((color) => (
            <button
              key={color}
              onClick={() => setCharacter({ ...character, eyeColor: color })}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                character.eyeColor === color ? 'border-white scale-110' : 'border-slate-600'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Expression */}
      <div>
        <label className="block text-white font-medium mb-3">Expression</label>
        <div className="grid grid-cols-3 gap-2">
          {customizationOptions.expressions.map((expr) => (
            <button
              key={expr.id}
              onClick={() => setCharacter({ ...character, expression: expr.id })}
              className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                character.expression === expr.id 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">{expr.icon}</div>
              <div className="text-xs text-white">{expr.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClothingTab = () => (
    <div className="space-y-6">
      {/* Outfit */}
      <div>
        <label className="block text-white font-medium mb-3">Outfit</label>
        <div className="grid grid-cols-2 gap-3">
          {customizationOptions.outfits[character.characterClass as keyof typeof customizationOptions.outfits]?.map((outfit) => (
            <button
              key={outfit.id}
              onClick={() => setCharacter({ ...character, outfit: outfit.id })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                character.outfit === outfit.id 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="text-3xl mb-2">{outfit.icon}</div>
              <div className="text-sm text-white font-medium">{outfit.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Weapon */}
      <div>
        <label className="block text-white font-medium mb-3">Weapon</label>
        <div className="grid grid-cols-2 gap-3">
          {customizationOptions.weapons[character.characterClass as keyof typeof customizationOptions.weapons]?.map((weapon) => (
            <button
              key={weapon.id}
              onClick={() => setCharacter({ ...character, weapon: weapon.id })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                character.weapon === weapon.id 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="text-3xl mb-2">{weapon.icon}</div>
              <div className="text-sm text-white font-medium">{weapon.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccessoriesTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-medium mb-3">Accessories</label>
        <div className="grid grid-cols-3 gap-3">
          {customizationOptions.accessories.map((accessory) => (
            <button
              key={accessory.id}
              onClick={() => setCharacter({ ...character, accessory: accessory.id })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                character.accessory === accessory.id 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-2">{accessory.icon}</div>
              <div className="text-xs text-white">{accessory.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-3">Pose</label>
        <div className="grid grid-cols-3 gap-3">
          {customizationOptions.poses.map((pose) => (
            <button
              key={pose.id}
              onClick={() => setCharacter({ ...character, pose: pose.id })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                character.pose === pose.id 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-2">{pose.icon}</div>
              <div className="text-xs text-white">{pose.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBackgroundTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-medium mb-3">Background Scene</label>
        <div className="grid grid-cols-2 gap-3">
          {customizationOptions.backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setCharacter({ ...character, background: bg.id })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                character.background === bg.id 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="text-3xl mb-2">{bg.preview}</div>
              <div className="text-sm text-white font-medium">{bg.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Character Creator</h1>
          <p className="text-slate-400">Design your unique avatar for {characterName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Character Preview */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Preview</h3>
              <p className="text-slate-400">{characterName} • {character.characterClass}</p>
            </div>
            
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={300}
                height={400}
                className="w-full max-w-sm mx-auto rounded-2xl border border-slate-600"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={randomizeCharacter}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Randomize
              </button>
              
              <button
                onClick={exportCharacter}
                className="bg-slate-700 text-white py-3 px-4 rounded-xl hover:bg-slate-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-6">
            {/* Tabs */}
            <div className="flex bg-slate-700 rounded-2xl p-1 mb-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'appearance' && renderAppearanceTab()}
              {activeTab === 'clothing' && renderClothingTab()}
              {activeTab === 'accessories' && renderAccessoriesTab()}
              {activeTab === 'background' && renderBackgroundTab()}
            </div>

            {/* Save Button */}
            <div className="mt-6 pt-6 border-t border-slate-600">
              <button
                onClick={() => onSave(character)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Character
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;