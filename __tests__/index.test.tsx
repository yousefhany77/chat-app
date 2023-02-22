import { render, screen } from '@testing-library/react'
import Chat from '../src/components/Chat'
import '@testing-library/jest-dom'

describe('Home', () => {
  it('renders a heading', () => {
    render(<Chat />)

    const heading = screen.getByRole('heading', {
      name: /chai app/i,
    })

    expect(heading).toBeInTheDocument()
  })
})