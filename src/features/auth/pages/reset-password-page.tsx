import { useSearchParams } from 'react-router-dom'
import { ResetPasswordForm } from '../auth-forms'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  return <ResetPasswordForm token={searchParams.get('token') ?? ''} />
}
