import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { GradeInputComponent } from './GradeInputComponent'
import { createGrade, gradeToString } from './Grade'

const meta: Meta<typeof GradeInputComponent> = {
  title: 'Shared/GradeInputComponent',
  component: GradeInputComponent,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof GradeInputComponent>

const StatefulGradeInput = (
  args: React.ComponentProps<typeof GradeInputComponent>
) => {
  const [value, setValue] = useState(args.value ?? null)

  return (
    <div style={{ maxWidth: 320 }}>
      <GradeInputComponent
        {...args}
        value={value}
        onChange={(nextValue) => setValue(nextValue)}
      />
      <div style={{ marginTop: 8, color: '#595959' }}>
        Numerischer Wert: {value ?? '—'}
      </div>
      <div style={{ marginTop: 4, color: '#595959' }}>
        Anzeige: {value ? gradeToString(value) : '—'}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: (args) => <StatefulGradeInput {...args} />,
  args: {
    value: null,
    placeholder: 'z. B. 2+, 1-2 oder 3,5',
  },
}

export const WithInitialValue: Story = {
  render: (args) => <StatefulGradeInput {...args} />,
  args: {
    value: createGrade(2.5),
    placeholder: 'z. B. 2+, 1-2 oder 3,5',
  },
}
