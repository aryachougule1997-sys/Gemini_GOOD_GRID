import React, { useState, useEffect } from 'react';
import { CharacterData, AccessoryItem } from '../../../shared/types';
import CharacterCreationForm from '../components/CharacterCreation/CharacterCreationForm';
import { CharacterService } from '../services/characterService';
import '../components/CharacterCreation/CharacterCreation.css';

interface CharacterCreationPageProps {
  userId?: string;
  onCharacterCreated?: (characterData: CharacterData) => void;
  onCancel?: () => void;
}

const CharacterCreationPage: React.FC<CharacterCreationPageProps> = ({
  userId = 'demo-user',
  onCharacterCreated,
  onCancel
}) => {
  const [availableAccessories, setAvailableAccessories] = useState<AccessoryItem[]>([]);
  const [initialCharacterData, setInitialCharacterData] = useState<CharacterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [userId]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    setError(null);

    try {
      // Load existing character data (if any)
      const characterResponse = await CharacterService.loadCharacter(userId);
      if (characterResponse.success && characterResponse.data) {
        setInitialCharacterData(characterResponse.data);
      } else {
        // Use default character data for new users
        setInitialCharacterData(CharacterService.createDefaultCharacter());
      }

      // Load available accessories
      const accessoriesResponse = await CharacterService.getAvailableAccessories(userId);
      if (accessoriesResponse.success && accessoriesResponse.data) {
        setAvailableAccessories(accessoriesResponse.data);
      } else {
        // Use default starter accessories
        setAvailableAccessories(CharacterService.getDefaultAccessories());
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load character data. Using defaults.');
      setInitialCharacterData(CharacterService.createDefaultCharacter());
      setAvailableAccessories(CharacterService.getDefaultAccessories());
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSaveCharacter = async (characterData: CharacterData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate character data
      const validation = CharacterService.validateCharacterData(characterData);
      if (!validation.isValid) {
        throw new Error(`Invalid character data: ${validation.errors.join(', ')}`);
      }

      // Save character data
      const response = await CharacterService.saveCharacter(userId, characterData);
      
      if (response.success) {
        // Success! Notify parent component
        if (onCharacterCreated) {
          onCharacterCreated(characterData);
        }
      } else {
        throw new Error(response.error || 'Failed to save character');
      }
    } catch (err) {
      console.error('Error saving character:', err);
      setError(err instanceof Error ? err.message : 'Failed to save character');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="character-creation-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading character creation...</p>
        </div>
      </div>
    );
  }

  if (!initialCharacterData) {
    return (
      <div className="character-creation-error">
        <h2>Error Loading Character Creation</h2>
        <p>Unable to load character creation data. Please try again.</p>
        <button onClick={loadInitialData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="character-creation-page">
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <CharacterCreationForm
        initialCharacterData={initialCharacterData}
        availableAccessories={availableAccessories}
        onSave={handleSaveCharacter}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CharacterCreationPage;