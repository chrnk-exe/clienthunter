import { Button, Input, Link, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import AuthShell from "../components/AuthShell";

function LoginPage() {
  return (
    <AuthShell title="Вход" subtitle="Введите никнейм и токен доступа">
      <Stack gap="4">
        <Stack gap="2">
          <Text fontSize="sm" color="gray.700">
            Никнейм
          </Text>
          <Input placeholder="nickname" />
        </Stack>
        <Stack gap="2">
          <Text fontSize="sm" color="gray.700">
            Пароль
          </Text>
          <Input type="password" placeholder="password" />
        </Stack>
        <Button
          bg="blue.600"
          color="white"
          _hover={{ bg: "blue.700" }}
          size="lg"
        >
          Войти
        </Button>
      </Stack>
      <Text fontSize="sm" color="gray.600">
        Нет аккаунта?{" "}
        <Link asChild color="blue.600">
          <RouterLink to="/register">Зарегистрироваться</RouterLink>
        </Link>
      </Text>
    </AuthShell>
  );
}

export default LoginPage;
