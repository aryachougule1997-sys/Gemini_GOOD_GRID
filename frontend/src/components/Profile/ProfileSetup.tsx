import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Camera, 
  MapPin, 
  Briefcase, 
  Award, 
  Code, 
  Plus, 
  X, 
  Upload,
  Calendar,
  Building,
  GraduationCap,
  Star,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Gamepad2
} from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profileData: CompleteProfileData) => void;
  userType: 'WORKER' | 'PROVIDER';
  initialData?: Partial<CompleteProfileData>;
}

interface CompleteProfileData {
  // Personal Info
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  location: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  profileImage?: File;
  bio: string;
  
  // Gaming Profile
  gamingUsername: string;
  characterName: string;
  characterClass: 'WARRIOR' | 'MAGE' | 'ROGUE' | 'PALADIN' | 'ARCHER';
  
  // Professional Info (for workers)
  workExperience?: WorkExperience[];
  skills?: Skill[];
  education?: Education[];
  certifications?: Certification[];
  portfolio?: PortfolioItem[];
  
  // Organization Info (for providers)
  organizationDetails?: {
    description: string;
    website?: string;
    industry: string;
    size: string;
    founded?: string;
  };
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Skill {
  id: string;
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  category: 'TECHNICAL' | 'SOFT' | 'LANGUAGE' | 'TOOL';
  yearsOfExperience: number;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  achievements: string[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  imageUrl?: string;
  completionDate: string;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, userType, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<CompleteProfileData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    location: { city: '', country: '' },
    bio: '',
    gamingUsername: '',
    characterName: '',
    characterClass: 'WARRIOR',
    workExperience: [],
    skills: [],
    education: [],
    certifications: [],
    portfolio: [],
    ...initialData
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const characterClasses = [
    { 
      id: 'WARRIOR', 
      name: 'Code Warrior', 
      description: 'Master of technical challenges and system architecture',
      icon: '⚔️',
      color: 'from-red-500 to-orange-500'
    },
    { 
      id: 'MAGE', 
      name: 'Data Mage', 
      description: 'Wielder of algorithms and data science magic',
      icon: '🔮',
      color: 'from-purple-500 to-blue-500'
    },
    { 
      id: 'ROGUE', 
      name: 'Security Rogue', 
      description: 'Stealthy expert in cybersecurity and penetration testing',
      icon: '🗡️',
      color: 'from-gray-600 to-gray-800'
    },
    { 
      id: 'PALADIN', 
      name: 'Project Paladin', 
      description: 'Noble leader of teams and guardian of project success',
      icon: '🛡️',
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      id: 'ARCHER', 
      name: 'Design Archer', 
      description: 'Precise creator of beautiful and functional designs',
      icon: '🏹',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const generateGamingUsername = () => {
    const adjectives = ['Shadow', 'Cyber', 'Quantum', 'Digital', 'Neon', 'Pixel', 'Code', 'Binary', 'Neural', 'Cosmic'];
    const nouns = ['Hunter', 'Wizard', 'Knight', 'Ninja', 'Phoenix', 'Dragon', 'Wolf', 'Eagle', 'Storm', 'Blade'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdjective}${randomNoun}${numbers}`;
  };

  const steps = userType === 'WORKER' 
    ? ['Personal Info', 'Gaming Profile', 'Work Experience', 'Skills & Education', 'Certifications', 'Portfolio']
    : ['Personal Info', 'Gaming Profile', 'Organization Details'];

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: ['']
    };
    setProfileData({
      ...profileData,
      workExperience: [...(profileData.workExperience || []), newExp]
    });
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'BEGINNER',
      category: 'TECHNICAL',
      yearsOfExperience: 0
    };
    setProfileData({
      ...profileData,
      skills: [...(profileData.skills || []), newSkill]
    });
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      verificationUrl: ''
    };
    setProfileData({
      ...profileData,
      certifications: [...(profileData.certifications || []), newCert]
    });
  };

  const addPortfolioItem = () => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: [],
      url: '',
      imageUrl: '',
      completionDate: ''
    };
    setProfileData({
      ...profileData,
      portfolio: [...(profileData.portfolio || []), newItem]
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileData({ ...profileData, profileImage: file });
    }
  };

  const renderPersonalInfoStep = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-slate-400">Tell us about yourself to create your hero profile</p>
      </div>

      {/* Profile Image */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
            {profileData.profileImage ? (
              <img 
                src={URL.createObjectURL(profileData.profileImage)} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-white" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">First Name</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Last Name</label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Date of Birth</label>
        <input
          type="date"
          value={profileData.dateOfBirth}
          onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">City</label>
          <input
            type="text"
            value={profileData.location.city}
            onChange={(e) => setProfileData({ 
              ...profileData, 
              location: { ...profileData.location, city: e.target.value }
            })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter your city"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Country</label>
          <input
            type="text"
            value={profileData.location.country}
            onChange={(e) => setProfileData({ 
              ...profileData, 
              location: { ...profileData.location, country: e.target.value }
            })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter your country"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Bio</label>
        <textarea
          value={profileData.bio}
          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-32 resize-none"
          placeholder="Tell us about yourself, your interests, and what drives you..."
          required
        />
      </div>
    </motion.div>
  );

  const renderGamingProfileStep = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Gaming Profile</h2>
        <p className="text-slate-400">Choose your identity in the Good Grid universe</p>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Gaming Username</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={profileData.gamingUsername}
            onChange={(e) => setProfileData({ ...profileData, gamingUsername: e.target.value })}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter your gaming username"
            required
          />
          <button
            type="button"
            onClick={() => setProfileData({ ...profileData, gamingUsername: generateGamingUsername() })}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        </div>
        <p className="text-slate-400 text-sm mt-1">This will be visible to other players when they search for you</p>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Character Name</label>
        <input
          type="text"
          value={profileData.characterName}
          onChange={(e) => setProfileData({ ...profileData, characterName: e.target.value })}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="Enter your character's name"
          required
        />
        <p className="text-slate-400 text-sm mt-1">This name will appear on the map and in your character profile</p>
      </div>

      <div>
        <label className="block text-white font-medium mb-4">Choose Your Character Class</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characterClasses.map((charClass) => (
            <motion.button
              key={charClass.id}
              type="button"
              onClick={() => setProfileData({ ...profileData, characterClass: charClass.id as any })}
              className={`
                p-4 rounded-2xl border-2 transition-all duration-300 text-left
                ${profileData.characterClass === charClass.id
                  ? `bg-gradient-to-br ${charClass.color} border-white/30 shadow-lg`
                  : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{charClass.icon}</span>
                <span className="text-white font-semibold">{charClass.name}</span>
              </div>
              <p className="text-white/80 text-sm">{charClass.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderWorkExperienceStep = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Work Experience</h2>
          <p className="text-slate-400">Add your professional experience to build your reputation</p>
        </div>
        <button
          type="button"
          onClick={addWorkExperience}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {profileData.workExperience?.map((exp, index) => (
          <div key={exp.id} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Company Name"
                value={exp.company}
                onChange={(e) => {
                  const updated = [...(profileData.workExperience || [])];
                  updated[index] = { ...exp, company: e.target.value };
                  setProfileData({ ...profileData, workExperience: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400"
              />
              <input
                type="text"
                placeholder="Position"
                value={exp.position}
                onChange={(e) => {
                  const updated = [...(profileData.workExperience || [])];
                  updated[index] = { ...exp, position: e.target.value };
                  setProfileData({ ...profileData, workExperience: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="date"
                placeholder="Start Date"
                value={exp.startDate}
                onChange={(e) => {
                  const updated = [...(profileData.workExperience || [])];
                  updated[index] = { ...exp, startDate: e.target.value };
                  setProfileData({ ...profileData, workExperience: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white"
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  placeholder="End Date"
                  value={exp.endDate}
                  disabled={exp.current}
                  onChange={(e) => {
                    const updated = [...(profileData.workExperience || [])];
                    updated[index] = { ...exp, endDate: e.target.value };
                    setProfileData({ ...profileData, workExperience: updated });
                  }}
                  className="flex-1 bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white disabled:opacity-50"
                />
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => {
                      const updated = [...(profileData.workExperience || [])];
                      updated[index] = { ...exp, current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate };
                      setProfileData({ ...profileData, workExperience: updated });
                    }}
                    className="rounded"
                  />
                  Current
                </label>
              </div>
            </div>

            <textarea
              placeholder="Job description and responsibilities..."
              value={exp.description}
              onChange={(e) => {
                const updated = [...(profileData.workExperience || [])];
                updated[index] = { ...exp, description: e.target.value };
                setProfileData({ ...profileData, workExperience: updated });
              }}
              className="w-full bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400 h-24 resize-none mb-4"
            />

            <button
              type="button"
              onClick={() => {
                const updated = profileData.workExperience?.filter((_, i) => i !== index) || [];
                setProfileData({ ...profileData, workExperience: updated });
              }}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
        ))}
      </div>

      {profileData.workExperience?.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No work experience added yet. Click "Add Experience" to get started.</p>
        </div>
      )}
    </motion.div>
  );

  const renderSkillsEducationStep = () => (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Skills</h3>
            <p className="text-slate-400">Add your technical and soft skills</p>
          </div>
          <button
            type="button"
            onClick={addSkill}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
          {profileData.skills?.map((skill, index) => (
            <div key={skill.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <input
                type="text"
                placeholder="Skill name"
                value={skill.name}
                onChange={(e) => {
                  const updated = [...(profileData.skills || [])];
                  updated[index] = { ...skill, name: e.target.value };
                  setProfileData({ ...profileData, skills: updated });
                }}
                className="w-full bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400 mb-3"
              />
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <select
                  value={skill.level}
                  onChange={(e) => {
                    const updated = [...(profileData.skills || [])];
                    updated[index] = { ...skill, level: e.target.value as any };
                    setProfileData({ ...profileData, skills: updated });
                  }}
                  className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white text-sm"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
                
                <select
                  value={skill.category}
                  onChange={(e) => {
                    const updated = [...(profileData.skills || [])];
                    updated[index] = { ...skill, category: e.target.value as any };
                    setProfileData({ ...profileData, skills: updated });
                  }}
                  className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white text-sm"
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="SOFT">Soft Skill</option>
                  <option value="LANGUAGE">Language</option>
                  <option value="TOOL">Tool</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <input
                  type="number"
                  placeholder="Years"
                  min="0"
                  max="50"
                  value={skill.yearsOfExperience}
                  onChange={(e) => {
                    const updated = [...(profileData.skills || [])];
                    updated[index] = { ...skill, yearsOfExperience: parseInt(e.target.value) || 0 };
                    setProfileData({ ...profileData, skills: updated });
                  }}
                  className="w-20 bg-slate-600 border border-slate-500 rounded-lg py-1 px-2 text-white text-sm"
                />
                
                <button
                  type="button"
                  onClick={() => {
                    const updated = profileData.skills?.filter((_, i) => i !== index) || [];
                    setProfileData({ ...profileData, skills: updated });
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderCertificationsStep = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Certifications & Awards</h2>
          <p className="text-slate-400">Add your professional certifications and achievements</p>
        </div>
        <button
          type="button"
          onClick={addCertification}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {profileData.certifications?.map((cert, index) => (
          <div key={cert.id} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Certification Name"
                value={cert.name}
                onChange={(e) => {
                  const updated = [...(profileData.certifications || [])];
                  updated[index] = { ...cert, name: e.target.value };
                  setProfileData({ ...profileData, certifications: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400"
              />
              <input
                type="text"
                placeholder="Issuing Organization"
                value={cert.issuer}
                onChange={(e) => {
                  const updated = [...(profileData.certifications || [])];
                  updated[index] = { ...cert, issuer: e.target.value };
                  setProfileData({ ...profileData, certifications: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white text-sm mb-1">Issue Date</label>
                <input
                  type="date"
                  value={cert.issueDate}
                  onChange={(e) => {
                    const updated = [...(profileData.certifications || [])];
                    updated[index] = { ...cert, issueDate: e.target.value };
                    setProfileData({ ...profileData, certifications: updated });
                  }}
                  className="w-full bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-white text-sm mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={cert.expiryDate}
                  onChange={(e) => {
                    const updated = [...(profileData.certifications || [])];
                    updated[index] = { ...cert, expiryDate: e.target.value };
                    setProfileData({ ...profileData, certifications: updated });
                  }}
                  className="w-full bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Credential ID (Optional)"
                value={cert.credentialId}
                onChange={(e) => {
                  const updated = [...(profileData.certifications || [])];
                  updated[index] = { ...cert, credentialId: e.target.value };
                  setProfileData({ ...profileData, certifications: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400"
              />
              <input
                type="url"
                placeholder="Verification URL (Optional)"
                value={cert.verificationUrl}
                onChange={(e) => {
                  const updated = [...(profileData.certifications || [])];
                  updated[index] = { ...cert, verificationUrl: e.target.value };
                  setProfileData({ ...profileData, certifications: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const updated = profileData.certifications?.filter((_, i) => i !== index) || [];
                setProfileData({ ...profileData, certifications: updated });
              }}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
        ))}
      </div>

      {profileData.certifications?.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No certifications added yet. Click "Add Certification" to get started.</p>
        </div>
      )}
    </motion.div>
  );

  const renderPortfolioStep = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Portfolio & Projects</h2>
          <p className="text-slate-400">Showcase your best work and projects</p>
        </div>
        <button
          type="button"
          onClick={addPortfolioItem}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {profileData.portfolio?.map((item, index) => (
          <div key={item.id} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Project Title"
                value={item.title}
                onChange={(e) => {
                  const updated = [...(profileData.portfolio || [])];
                  updated[index] = { ...item, title: e.target.value };
                  setProfileData({ ...profileData, portfolio: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400"
              />
              <input
                type="date"
                placeholder="Completion Date"
                value={item.completionDate}
                onChange={(e) => {
                  const updated = [...(profileData.portfolio || [])];
                  updated[index] = { ...item, completionDate: e.target.value };
                  setProfileData({ ...profileData, portfolio: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white"
              />
            </div>
            
            <textarea
              placeholder="Project description..."
              value={item.description}
              onChange={(e) => {
                const updated = [...(profileData.portfolio || [])];
                updated[index] = { ...item, description: e.target.value };
                setProfileData({ ...profileData, portfolio: updated });
              }}
              className="w-full bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400 h-24 resize-none mb-4"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="url"
                placeholder="Project URL (Optional)"
                value={item.url}
                onChange={(e) => {
                  const updated = [...(profileData.portfolio || [])];
                  updated[index] = { ...item, url: e.target.value };
                  setProfileData({ ...profileData, portfolio: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400"
              />
              <input
                type="text"
                placeholder="Technologies (comma-separated)"
                value={item.technologies.join(', ')}
                onChange={(e) => {
                  const updated = [...(profileData.portfolio || [])];
                  updated[index] = { ...item, technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t) };
                  setProfileData({ ...profileData, portfolio: updated });
                }}
                className="bg-slate-600 border border-slate-500 rounded-lg py-2 px-3 text-white placeholder-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const updated = profileData.portfolio?.filter((_, i) => i !== index) || [];
                setProfileData({ ...profileData, portfolio: updated });
              }}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
        ))}
      </div>

      {profileData.portfolio?.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No projects added yet. Click "Add Project" to showcase your work.</p>
        </div>
      )}
    </motion.div>
  );

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(profileData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderOrganizationStep = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Organization Details</h2>
        <p className="text-slate-400">Tell us about your organization</p>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Organization Description</label>
        <textarea
          value={profileData.organizationDetails?.description || ''}
          onChange={(e) => setProfileData({ 
            ...profileData, 
            organizationDetails: { 
              description: e.target.value,
              industry: profileData.organizationDetails?.industry || '',
              size: profileData.organizationDetails?.size || '',
              website: profileData.organizationDetails?.website || '',
              founded: profileData.organizationDetails?.founded || ''
            } 
          })}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-32 resize-none"
          placeholder="Describe your organization, its mission, and what you do..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Website</label>
          <input
            type="url"
            value={profileData.organizationDetails?.website || ''}
            onChange={(e) => setProfileData({ 
              ...profileData, 
              organizationDetails: { 
                description: profileData.organizationDetails?.description || '',
                industry: profileData.organizationDetails?.industry || '',
                size: profileData.organizationDetails?.size || '',
                website: e.target.value,
                founded: profileData.organizationDetails?.founded || ''
              } 
            })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="https://your-organization.com"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Industry</label>
          <select
            value={profileData.organizationDetails?.industry || ''}
            onChange={(e) => setProfileData({ 
              ...profileData, 
              organizationDetails: { 
                description: profileData.organizationDetails?.description || '',
                industry: e.target.value,
                size: profileData.organizationDetails?.size || '',
                website: profileData.organizationDetails?.website || '',
                founded: profileData.organizationDetails?.founded || ''
              } 
            })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          >
            <option value="">Select Industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="consulting">Consulting</option>
            <option value="nonprofit">Non-Profit</option>
            <option value="government">Government</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Organization Size</label>
          <select
            value={profileData.organizationDetails?.size || ''}
            onChange={(e) => setProfileData({ 
              ...profileData, 
              organizationDetails: { 
                description: profileData.organizationDetails?.description || '',
                industry: profileData.organizationDetails?.industry || '',
                size: e.target.value,
                website: profileData.organizationDetails?.website || '',
                founded: profileData.organizationDetails?.founded || ''
              } 
            })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Founded Year</label>
          <input
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            value={profileData.organizationDetails?.founded || ''}
            onChange={(e) => setProfileData({ 
              ...profileData, 
              organizationDetails: { 
                description: profileData.organizationDetails?.description || '',
                industry: profileData.organizationDetails?.industry || '',
                size: profileData.organizationDetails?.size || '',
                website: profileData.organizationDetails?.website || '',
                founded: e.target.value
              } 
            })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="2020"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    if (userType === 'WORKER') {
      switch (currentStep) {
        case 0: return renderPersonalInfoStep();
        case 1: return renderGamingProfileStep();
        case 2: return renderWorkExperienceStep();
        case 3: return renderSkillsEducationStep();
        case 4: return renderCertificationsStep();
        case 5: return renderPortfolioStep();
        default: return renderPersonalInfoStep();
      }
    } else {
      // PROVIDER flow
      switch (currentStep) {
        case 0: return renderPersonalInfoStep();
        case 1: return renderGamingProfileStep();
        case 2: return renderOrganizationStep();
        default: return renderPersonalInfoStep();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Profile Setup</h1>
            <span className="text-slate-400">{currentStep + 1} of {steps.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div className={`
                  flex-1 h-2 rounded-full transition-all duration-300
                  ${index <= currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-700'}
                `} />
                {index < steps.length - 1 && (
                  <div className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${index < currentStep ? 'bg-green-500' : index === currentStep ? 'bg-blue-500' : 'bg-slate-600'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span key={step} className={`
                text-xs transition-colors duration-300
                ${index <= currentStep ? 'text-white' : 'text-slate-500'}
              `}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-8 mb-8">
          <AnimatePresence mode="wait">
            {renderCurrentStep()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;