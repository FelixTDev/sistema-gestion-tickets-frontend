import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingState } from './states'

describe('estado de carga', () => {
  it('anuncia que la información está cargando', () => {
    render(<LoadingState />)
    expect(screen.getByRole('status')).toHaveTextContent(/cargando información/i)
  })
})
