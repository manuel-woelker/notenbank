import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { ClassTable } from './ClassTable'
import type { Class } from './types'

const sampleClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Mathematics 101',
    createdAt: new Date('2024-10-15T09:00:00Z'),
    updatedAt: new Date('2024-10-20T08:45:00Z'),
  },
  {
    id: 'class-2',
    name: 'Biology 201',
    createdAt: new Date('2024-10-22T13:30:00Z'),
    updatedAt: new Date('2024-10-25T12:10:00Z'),
  },
  {
    id: 'class-3',
    name: 'History 301',
    createdAt: new Date('2024-11-01T08:15:00Z'),
    updatedAt: new Date('2024-11-02T10:05:00Z'),
  },
]

const meta: Meta<typeof ClassTable> = {
  title: 'Administration/Classes/ClassTable',
  component: ClassTable,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof ClassTable>

export const Default: Story = {
  args: {
    classes: sampleClasses,
    loading: false,
  },
}

export const Empty: Story = {
  args: {
    classes: [],
    loading: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText('No classes found. Click "Add Class" to create one.')
    ).toBeInTheDocument()
  },
}

export const Loading: Story = {
  args: {
    classes: sampleClasses,
    loading: true,
  },
}
