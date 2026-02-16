import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Pet } from '../types';
import { listPets } from '../services/pets';

interface PetState {
  pets: Pet[];
  selectedPet: Pet | null;
  isLoading: boolean;
  error: string | null;
  refreshPets: () => Promise<void>;
  selectPet: (pet: Pet | null) => void;
}

const PetContext = createContext<PetState | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await listPets();
      setPets(list);
      if (selectedPet) {
        const updated = list.find((p) => p.id === selectedPet.id);
        setSelectedPet(updated ?? list[0] ?? null);
      } else if (list.length > 0) {
        setSelectedPet(list[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPet]);

  const selectPet = useCallback((pet: Pet | null) => setSelectedPet(pet), []);

  return (
    <PetContext.Provider value={{ pets, selectedPet, isLoading, error, refreshPets, selectPet }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePets() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePets must be used within PetProvider');
  return ctx;
}
