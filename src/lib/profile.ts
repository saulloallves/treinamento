export type SelectedProfile = 'Admin' | 'Aluno';

const PROFILE_KEY = 'selected_profile';

export function getSelectedProfile(): SelectedProfile | null {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored as SelectedProfile | null;
  } catch {
    return null;
  }
}

export function setSelectedProfile(profile: SelectedProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, profile);
  } catch {
    // Silent fail for SSR compatibility
  }
}

export function clearSelectedProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // Silent fail for SSR compatibility
  }
}