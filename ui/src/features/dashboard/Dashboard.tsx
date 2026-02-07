import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export function Dashboard() {
  return (
    <div>
      <Title level={1}>Welcome to Notenbank</Title>
      <Paragraph>
        This is the main content area. Your application content will go here.
      </Paragraph>
    </div>
  )
}
