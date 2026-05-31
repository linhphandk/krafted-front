import { Heading, Text, Card, Flex } from "@radix-ui/themes"
import { useAuth } from "@/context"

const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <Flex direction="column" gap="4">
      <Heading size="6">Welcome back, {user?.name}</Heading>
      <Card size="2">
        <Flex direction="column" gap="2" p="4">
          <Text size="2" weight="medium">Quick stats</Text>
          <Text size="2" color="gray">You are signed in as {user?.email}</Text>
        </Flex>
      </Card>
    </Flex>
  )
}

export default DashboardPage
