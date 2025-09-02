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

// Auto-detect profile based on user permissions
export function getAutoDetectedProfile(isAdmin: boolean): SelectedProfile {
  // If there's a stored profile, use it
  const stored = getSelectedProfile();
  if (stored) return stored;
  
  // Auto-detect: if user is admin, default to Admin, otherwise Aluno
  return isAdmin ? 'Admin' : 'Aluno';
}