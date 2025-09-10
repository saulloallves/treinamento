export type SelectedProfile = 'Admin' | 'Aluno' | 'Professor';

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
export function getAutoDetectedProfile(isAdmin: boolean, isProfessor?: boolean): SelectedProfile {
  // If there's a stored profile, use it
  const stored = getSelectedProfile();
  if (stored) return stored;
  
  // Auto-detect: if user is admin, default to Admin
  // If user is professor, default to Professor
  // Otherwise default to Aluno
  if (isAdmin) return 'Admin';
  if (isProfessor) return 'Professor';
  return 'Aluno';
}