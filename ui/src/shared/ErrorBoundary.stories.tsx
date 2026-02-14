import type { Meta, StoryObj } from '@storybook/react'
import { ErrorBoundary } from './ErrorBoundary'

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Shared/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof ErrorBoundary>

/* 📖 # Why render the fallback directly in the Default story?
Storybook stories should show the component's visual output without
triggering side-effects. Rendering the boundary with no children that
throw shows the normal pass-through behaviour.
*/
export const Default: Story = {
  args: {
    children: <div>Normaler Inhalt ohne Fehler</div>,
  },
}

const ThrowOnMount = () => {
  throw new Error('Beispiel-Fehler beim Rendern')
}

/* 📖 # Why use a component that throws in WithError?
This lets Storybook display the actual error fallback UI that users would
see in production, without needing to manually trigger an error.
*/
export const WithError: Story = {
  render: () => (
    <ErrorBoundary>
      <ThrowOnMount />
    </ErrorBoundary>
  ),
}
