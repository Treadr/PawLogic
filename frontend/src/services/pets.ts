import { api } from './api';
import type { Pet, PetCreate, PetUpdate } from '../types';

export async function createPet(data: PetCreate): Promise<Pet> {
  return api.post<Pet>('/pets', data);
}

export async function listPets(): Promise<Pet[]> {
  return api.get<Pet[]>('/pets');
}

export async function getPet(petId: string): Promise<Pet> {
  return api.get<Pet>(`/pets/${petId}`);
}

export async function updatePet(petId: string, data: PetUpdate): Promise<Pet> {
  return api.put<Pet>(`/pets/${petId}`, data);
}

export async function deletePet(petId: string): Promise<void> {
  return api.delete<void>(`/pets/${petId}`);
}
