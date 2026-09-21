import type { Role } from '../../../types/auth'

export type ProfileRead = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: Role | string
  email_verified: boolean
  created_at: string
  updated_at: string
}

export type ProfileUpdate = {
  full_name?: string | null
  phone?: string | null
}

export type PreferredLanguage = 'es' | 'en'

export type PreferencesRead = {
  in_app_enabled: boolean
  email_enabled: boolean
  assignment_enabled: boolean
  status_change_enabled: boolean
  comment_enabled: boolean
  sla_enabled: boolean
  preferred_language: PreferredLanguage
  timezone: string
  security_events_enabled: boolean
}

export type PreferencesUpdate = {
  in_app_enabled?: boolean | null
  email_enabled?: boolean | null
  assignment_enabled?: boolean | null
  status_change_enabled?: boolean | null
  comment_enabled?: boolean | null
  sla_enabled?: boolean | null
  preferred_language?: PreferredLanguage | null
  timezone?: string | null
  security_events_enabled?: boolean | null
}
