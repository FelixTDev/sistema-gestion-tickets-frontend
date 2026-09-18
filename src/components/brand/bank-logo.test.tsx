import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BankLogo } from './bank-logo'

describe('BankLogo', () => {
  it('renders the Banco GNB typographic brand name', () => {
    render(<BankLogo variant="horizontal" />)

    expect(screen.getByRole('img', { name: /banco gnb/i })).toBeInTheDocument()
    expect(screen.getByText('Banco GNB')).toBeInTheDocument()
    expect(screen.getByText('Perú')).toBeInTheDocument()
  })

  it('adapts styles cleanly for dark surfaces', () => {
    render(<BankLogo variant="stacked" surface="dark" />)

    const logo = screen.getByRole('img', { name: /banco gnb/i })
    expect(logo).toBeInTheDocument()
    expect(screen.getByText('Banco GNB')).toHaveClass('text-white')
  })
})
