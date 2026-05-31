import { Outlet, useNavigate } from "react-router"
import { Box, Flex, Heading, Button, Text, DropdownMenu, Avatar } from "@radix-ui/themes"
import { useAuth } from "@/context"

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  return (
    <Flex direction="column" style={{ minHeight: "100vh" }}>
      <Box
        p="3"
        style={{
          borderBottom: "1px solid var(--gray-a5)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Flex align="center" gap="3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="ghost" size="2">☰</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              <DropdownMenu.Item onClick={() => navigate("/dashboard")} style={itemStyle}>
                Dashboard
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item onClick={() => navigate("/listings")} style={itemStyle}>
                Browse Listings
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => navigate("/listings/mine")} style={itemStyle}>
                My Listings
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => navigate("/listings/new")} style={itemStyle}>
                Create Listing
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <Heading size="4">Krafted</Heading>
        </Flex>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" size="2">
              <Avatar size="1" radius="full" fallback={user?.name?.charAt(0) || "?"} />
              <Text size="2" ml="1">{user?.email}</Text>
            </Button>
          </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item onClick={() => navigate(`/users/${user?.id}`)} style={itemStyle}>
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color="red" onClick={handleLogout} style={itemStyle}>
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Box>

      <Box p="4" style={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Flex>
  )
}

const itemStyle: React.CSSProperties = { cursor: "pointer" }
