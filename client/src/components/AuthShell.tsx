import type { ReactNode } from "react";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" px="4" py="12">
      <Box
        w="full"
        maxW="420px"
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        boxShadow="lg"
        p={{ base: "6", md: "8" }}
      >
        <Stack gap="6">
          <Stack gap="1">
            <Heading size="lg">{title}</Heading>
            <Text color="gray.600">{subtitle}</Text>
          </Stack>
          {children}
          {footer ? <Box>{footer}</Box> : null}
        </Stack>
      </Box>
    </Flex>
  );
}

export default AuthShell;
