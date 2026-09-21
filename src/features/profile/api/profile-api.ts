import { apiClient } from '../../../lib/api-client'
import type { PreferencesRead, PreferencesUpdate, ProfileRead, ProfileUpdate } from '../types/profile-types'

export function getMyProfile(): Promise<ProfileRead> {
  return apiClient.get<ProfileRead>('/users/me/profile')
}

export function updateMyProfile(data: ProfileUpdate): Promise<ProfileRead> {
  return apiClient.patch<ProfileRead>('/users/me/profile', data)
}

export function getMyPreferences(): Promise<PreferencesRead> {
  return apiClient.get<PreferencesRead>('/users/me/preferences')
}

export function updateMyPreferences(data: PreferencesUpdate): Promise<PreferencesRead> {
  return apiClient.patch<PreferencesRead>('/users/me/preferences', data)
}
