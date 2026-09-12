export type Role = 'CLIENTE' | 'ASESOR' | 'SUPERVISOR'
export type AuthUser = { id: string; full_name: string; email: string; role: Role }
export type RegisterRequest = { full_name: string; email: string; password: string; phone?: string }
export type RegisterResponse = AuthUser
export type LoginRequest = { email: string; password: string }
export type LoginResponse = { access_token: string; token_type: 'bearer'; user: AuthUser }
export type LogoutResponse = { message: string }
export type Session = { user: AuthUser; accessToken: string }
