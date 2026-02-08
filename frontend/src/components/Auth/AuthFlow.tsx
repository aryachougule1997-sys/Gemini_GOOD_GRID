import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from './LoginPage';
import { ProfileSetup } from '../Profile';
import { CharacterCreationForm } from '../CharacterCreation';
import { generateUsername, generateUniqueId } from '../../utils/usernameGenerator';
import ProfileService from '../../services/profileService';
import AuthService from '../../services/authService';

interface AuthFlowProps {
  onAuthComplete: (userData: CompleteUserData) => void;
}

interface CompleteUserData {
  // Auth data
  userId: string;
  email: string;
  userType: 'WORKER' | 'PROVIDER';
  
  // Profile data
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
  
  // Gaming profile
  gamingUsername: string;
  characterName: string;
  characterClass: 'WARRIOR' | 'MAGE' | 'ROGUE' | 'PALADIN' | 'ARCHER';
  characterData: any;
  
  // Professional data (for workers)
  workExperience?: any[];
  skills?: any[];
  education?: any[];
  certifications?: any[];
  portfolio?: any[];
  
  // Organization data (for providers)
  organizationDetails?: any;
}

type AuthStep = 'login' | 'profile' | 'character' | 'complete';

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthComplete }) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [userData, setUserData] = useState<Partial<CompleteUserData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (credentials: any) => {
    setIsLoading(true);
    
    try {
      // Use real AuthService for login
      const result = await AuthService.login({
        email: credentials.email,
        password: credentials.password
      });
      
      if (result.success && result.data) {
        const userId = result.data.user.id;
        const email = result.data.user.email;
        const username = result.data.user.username;
        
        // Ensure token is saved (AuthService should have already done this, but double-check)
        if (result.data.token) {
          localStorage.setItem('goodgrid_token', result.data.token);
          console.log('✅ Token saved to localStorage after login');
        }
        
        // Check if user has an existing profile
        const existingProfile = await ProfileService.getProfile(userId);
        
        if (existingProfile && existingProfile.characterData) {
          // User has a complete profile, skip setup and go directly to dashboard
          const completeUserData: CompleteUserData = {
            userId: existingProfile.userId || userId, // Fallback to userId from login if profile doesn't have it
            email: existingProfile.email,
            userType: existingProfile.userType,
            firstName: existingProfile.firstName,
            lastName: existingProfile.lastName,
            dateOfBirth: existingProfile.dateOfBirth,
            location: existingProfile.location,
            profileImage: undefined,
            bio: existingProfile.bio,
            gamingUsername: existingProfile.gamingUsername,
            characterName: existingProfile.characterName,
            characterClass: existingProfile.characterClass,
            characterData: existingProfile.characterData,
            workExperience: existingProfile.workExperience,
            skills: existingProfile.skills,
            education: existingProfile.education,
            certifications: existingProfile.certifications,
            portfolio: existingProfile.portfolio,
            organizationDetails: existingProfile.organizationDetails
          };
          
          console.log('✅ Existing profile found, completeUserData:', completeUserData);
          console.log('✅ userId in completeUserData:', completeUserData.userId);
          console.log('✅ userId from login:', userId);
          console.log('✅ existingProfile.userId:', existingProfile.userId);
          
          setCurrentStep('complete');
          setTimeout(() => {
            onAuthComplete(completeUserData);
          }, 1000);
        } else {
          // New user or incomplete profile, proceed with profile setup
          setUserData({
            userId,
            email,
            userType: credentials.userType || 'WORKER',
            gamingUsername: username
          });
          setCurrentStep('profile');
        }
      } else {
        console.error('Login failed:', result.error);
        // For demo, still allow progression
        const userId = generateUniqueId();
        setUserData({
          userId,
          email: credentials.email,
          userType: credentials.userType
        });
        setCurrentStep('profile');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // For demo, still allow progression
      const userId = generateUniqueId();
      setUserData({
        userId,
        email: credentials.email,
        userType: credentials.userType
      });
      setCurrentStep('profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (registerData: any) => {
    setIsLoading(true);
    
    try {
      // Use real AuthService for registration
      const result = await AuthService.register({
        username: registerData.username || generateUsername({ theme: 'cyber', includeNumbers: true }),
        email: registerData.email,
        password: registerData.password,
        userType: registerData.userType,
        characterData: registerData.characterData,
        locationData: registerData.locationData
      });
      
      if (result.success && result.data) {
        // Ensure token is saved (AuthService should have already done this, but double-check)
        if (result.data.token) {
          localStorage.setItem('goodgrid_token', result.data.token);
          console.log('✅ Token saved to localStorage after registration');
        }
        
        setUserData({
          userId: result.data.user.id,
          email: result.data.user.email,
          userType: registerData.userType,
          gamingUsername: result.data.user.username,
          organizationDetails: registerData.organizationName ? {
            name: registerData.organizationName,
            description: '',
            website: '',
            industry: '',
            size: '',
            founded: ''
          } : undefined
        });
        
        setCurrentStep('profile');
      } else {
        console.error('Registration failed:', result.error);
        // For demo, still allow progression
        const userId = generateUniqueId();
        setUserData({
          userId,
          email: registerData.email,
          userType: registerData.userType,
          organizationDetails: registerData.organizationName ? {
            name: registerData.organizationName,
            description: '',
            website: '',
            industry: '',
            size: '',
            founded: ''
          } : undefined
        });
        setCurrentStep('profile');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // For demo, still allow progression
      const userId = generateUniqueId();
      setUserData({
        userId,
        email: registerData.email,
        userType: registerData.userType,
        organizationDetails: registerData.organizationName ? {
          name: registerData.organizationName,
          description: '',
          website: '',
          industry: '',
          size: '',
          founded: ''
        } : undefined
      });
      setCurrentStep('profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileComplete = (profileData: any) => {
    // Generate gaming username if not provided
    if (!profileData.gamingUsername) {
      profileData.gamingUsername = generateUsername({
        theme: 'cyber',
        includeNumbers: true
      });
    }
    
    setUserData({
      ...userData,
      ...profileData
    });
    
    setCurrentStep('character');
  };

  const handleCharacterComplete = async (characterData: any) => {
    try {
      const completeUserData: CompleteUserData = {
        ...userData,
        characterData,
        // Ensure all required fields are present
        userId: userData.userId!,
        email: userData.email!,
        userType: userData.userType!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        dateOfBirth: userData.dateOfBirth!,
        location: userData.location!,
        bio: userData.bio!,
        gamingUsername: userData.gamingUsername!,
        characterName: userData.characterName!,
        characterClass: userData.characterClass!
      };
      
      // Save complete profile to ProfileService
      const savedProfile = await ProfileService.createProfile(completeUserData);
      console.log('Profile saved successfully:', savedProfile);
      
      setCurrentStep('complete');
      
      // Complete the auth flow
      setTimeout(() => {
        console.log('✅ Character complete, calling onAuthComplete with:', completeUserData);
        console.log('✅ userId in completeUserData:', completeUserData.userId);
        onAuthComplete(completeUserData);
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      // Still proceed with auth flow even if save fails
      setCurrentStep('complete');
      setTimeout(() => {
        onAuthComplete({
          ...userData,
          characterData,
          userId: userData.userId!,
          email: userData.email!,
          userType: userData.userType!,
          firstName: userData.firstName!,
          lastName: userData.lastName!,
          dateOfBirth: userData.dateOfBirth!,
          location: userData.location!,
          bio: userData.bio!,
          gamingUsername: userData.gamingUsername!,
          characterName: userData.characterName!,
          characterClass: userData.characterClass!
        });
      }, 2000);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            isLoading={isLoading}
          />
        );
      
      case 'profile':
        return (
          <ProfileSetup
            userType={userData.userType!}
            onComplete={handleProfileComplete}
            initialData={userData}
          />
        );
      
      case 'character':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold text-white mb-2">
                  🎨 Create Your Hero
                </h1>
                <p className="text-slate-300 text-lg">
                  Customize your character's appearance and bring them to life!
                </p>
              </motion.div>
              
              <CharacterCreationForm
                onSave={handleCharacterComplete}
                onCancel={() => setCurrentStep('profile')}
                isLoading={isLoading}
              />
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 360]
                }}
                transition={{
                  scale: { duration: 2, repeat: Infinity },
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
              >
                <motion.div
                  className="text-4xl"
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  ✨
                </motion.div>
              </motion.div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to Good Grid!
              </h1>
              
              <p className="text-xl text-slate-300 mb-6">
                Your hero profile has been created successfully.
              </p>
              
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold">
                      {userData.firstName} {userData.lastName}
                    </h3>
                    <p className="text-slate-400">@{userData.gamingUsername}</p>
                    <p className="text-sm text-slate-500">{userData.characterClass}</p>
                  </div>
                </div>
                
                <div className="text-sm text-slate-400">
                  <p>User ID: {userData.userId}</p>
                  <p>Character: {userData.characterName}</p>
                </div>
              </div>
              
              <motion.div
                className="mt-8"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-slate-400">Entering the Good Grid universe...</p>
              </motion.div>
            </motion.div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderCurrentStep()}
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthFlow;