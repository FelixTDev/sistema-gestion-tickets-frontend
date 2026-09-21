import { useSearchParams } from 'react-router-dom'
import { VerifyEmailForm } from '../auth-forms'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  return <VerifyEmailForm token={searchParams.get('token') ?? ''} />
}
