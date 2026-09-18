import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BankLogo } from './bank-logo'

describe('BankLogo', () => {
  it('renders only the authorized horizontal logo asset', () => {
    render(<BankLogo variant="horizontal" />)

    expect(screen.getByRole('img', { name: /banco gnb/i })).toHaveAttribute(
      'src',
      expect.stringContaining('banco-gnb-horizontal.png'),
    )
  })

  it('uses the authorized stacked asset on a white plate for dark surfaces', () => {
    render(<BankLogo variant="stacked" surface="dark" />)

    const logo = screen.getByRole('img', { name: /banco gnb/i })
    expect(logo).toHaveAttribute('src', expect.stringContaining('banco-gnb-apilado.png'))
    expect(logo.parentElement).toHaveClass('bg-white')
  })
})
