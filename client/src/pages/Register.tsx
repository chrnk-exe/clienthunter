import { useState } from "react";
import { Button, Input, Link, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import AuthShell from "../components/AuthShell";

function RegisterPage() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");

  return (
    <AuthShell title="Регистрация" subtitle="Создайте уникальный никнейм">
      <Stack gap="4">
        <Stack gap="2">
          <Text fontSize="sm" color="gray.700">
            Никнейм
          </Text>
          <Input
            placeholder="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </Stack>
        <Stack gap="2">
          <Text fontSize="sm" color="gray.700">
            Пароль
          </Text>
          <Input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Stack>
        <Stack gap="2">
          <Text fontSize="sm" color="gray.700">
            Повторите пароль
          </Text>
          <Input
            type="password"
            placeholder="repeat password"
            value={secondPassword}
            onChange={(e) => setSecondPassword(e.target.value)}
          />
        </Stack>
        <Button
          bg="blue.600"
          color="white"
          _hover={{ bg: "blue.700" }}
          size="lg"
          disabled={!nickname || !password || password !== secondPassword}
        >
          Зарегистрироваться
        </Button>
      </Stack>
      <Text fontSize="sm" color="gray.600">
        Уже есть аккаунт?{" "}
        <Link asChild color="blue.600">
          <RouterLink to="/login">Зарегистрироваться</RouterLink>
        </Link>
      </Text>
    </AuthShell>
  );
}

export default RegisterPage;
