export type Role = 'CLIENTE' | 'ASESOR' | 'SUPERVISOR'
export type Session = { userId: string; fullName: string; role: Role; accessToken?: string }
