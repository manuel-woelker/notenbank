import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export function Dashboard() {
  return (
    <div>
      <Title level={1}>Willkommen bei Notenbank</Title>
      <Paragraph>
        Dies ist der Hauptinhalt. Hier erscheinen die Inhalte der Anwendung.
      </Paragraph>
    </div>
  )
}
