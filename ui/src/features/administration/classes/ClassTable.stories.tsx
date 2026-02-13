import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { ClassTable } from './ClassTable'
import type { Class } from './ClassTypes'

const sampleClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Mathematik 101',
    createdAt: new Date('2024-10-15T09:00:00Z'),
    updatedAt: new Date('2024-10-20T08:45:00Z'),
  },
  {
    id: 'class-2',
    name: 'Biologie 201',
    createdAt: new Date('2024-10-22T13:30:00Z'),
    updatedAt: new Date('2024-10-25T12:10:00Z'),
  },
  {
    id: 'class-3',
    name: 'Geschichte 301',
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
    onSelectClass: () => {},
    onCreateClass: async () => {},
    onUpdateClass: async () => {},
  },
}

export const Empty: Story = {
  args: {
    classes: [],
    loading: false,
    onSelectClass: () => {},
    onCreateClass: async () => {},
    onUpdateClass: async () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText(
        'Keine Klassen gefunden. Oben eine neue Klasse hinzufügen.'
      )
    ).toBeInTheDocument()
  },
}

export const Loading: Story = {
  args: {
    classes: sampleClasses,
    loading: true,
    onSelectClass: () => {},
    onCreateClass: async () => {},
    onUpdateClass: async () => {},
  },
}
