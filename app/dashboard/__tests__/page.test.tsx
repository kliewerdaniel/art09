import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DashboardPage from '../page'

describe('Dashboard Page', () => {
  it('renders dashboard title and description', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText("Welcome back! Here's your overview.")).toBeInTheDocument()
  })

  it('renders metric cards with correct values', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()

    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$45,231')).toBeInTheDocument()

    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()

    expect(screen.getByText('Growth Rate')).toBeInTheDocument()
    expect(screen.getByText('+23.1%')).toBeInTheDocument()
  })

  it('renders chart sections', () => {
    render(<DashboardPage />)

    expect(screen.getByText('User Growth')).toBeInTheDocument()
    expect(screen.getByText('Monthly user acquisition over time')).toBeInTheDocument()

    expect(screen.getByText('Revenue Trend')).toBeInTheDocument()
    expect(screen.getByText('Monthly revenue progression')).toBeInTheDocument()

    expect(screen.getByText('Chart visualization')).toBeInTheDocument()
    expect(screen.getByText('Revenue analytics')).toBeInTheDocument()
  })

  it('renders recent activity section', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Latest user actions and system events')).toBeInTheDocument()

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Created new LLM job')).toBeInTheDocument()
    expect(screen.getByText('2 minutes ago')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<DashboardPage />)

    expect(screen.getByText('New Job')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders all metric icons', () => {
    render(<DashboardPage />)

    // Check that SVG icons are rendered (Lucide icons)
    const icons = document.querySelectorAll('svg.lucide')
    expect(icons.length).toBeGreaterThan(0)
  })
})
