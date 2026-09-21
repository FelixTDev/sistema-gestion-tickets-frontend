export type MessageResponse = { message: string }

export type ForgotPasswordRequest = { email: string }
export type ResetPasswordRequest = { token?: string; new_password: string }
export type ChangePasswordRequest = { current_password: string; new_password: string }
export type VerifyEmailRequest = { token?: string }
