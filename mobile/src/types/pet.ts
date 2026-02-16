export type Species = 'cat' | 'dog';
export type Sex = 'male' | 'female' | 'unknown';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string | null;
  age_years: number | null;
  age_months: number | null;
  weight_lbs: number | null;
  sex: Sex;
  is_neutered: boolean;
  temperament: string[];
  medical_notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PetCreate {
  name: string;
  species: Species;
  breed?: string;
  age_years?: number;
  age_months?: number;
  weight_lbs?: number;
  sex?: Sex;
  is_neutered?: boolean;
  temperament?: string[];
  medical_notes?: string;
}
