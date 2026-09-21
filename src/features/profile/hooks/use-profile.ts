import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyPreferences, getMyProfile, updateMyPreferences, updateMyProfile } from '../api/profile-api'
import type { PreferencesUpdate, ProfileUpdate } from '../types/profile-types'

export const profileQueryKey = ['my-profile'] as const
export const preferencesQueryKey = ['my-preferences'] as const

export function useProfile() {
  return useQuery({ queryKey: profileQueryKey, queryFn: getMyProfile, retry: false })
}

export function usePreferences() {
  return useQuery({ queryKey: preferencesQueryKey, queryFn: getMyPreferences, retry: false })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProfileUpdate) => updateMyProfile(data),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, profile)
    },
  })
}

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PreferencesUpdate) => updateMyPreferences(data),
    onSuccess: (preferences) => {
      queryClient.setQueryData(preferencesQueryKey, preferences)
    },
  })
}
