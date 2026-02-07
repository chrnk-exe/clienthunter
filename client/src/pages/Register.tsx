import { Button, Input, Link, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useRegisterMutation } from "../store/api";

function RegisterPage() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await register({ nickname, password }).unwrap();
      navigate("/main");
    } catch {
      setError("Registration failed. Try another nickname.");
    }
  }

  return (
    <AuthShell title="Register" subtitle="Create a unique nickname">
      <form onSubmit={handleSubmit}>
        <Stack gap="4">
          <Stack gap="2">
            <Text fontSize="sm" color="gray.700">
              Nickname
            </Text>
            <Input
              placeholder="nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
          </Stack>
          <Stack gap="2">
            <Text fontSize="sm" color="gray.700">
              Password
            </Text>
            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Stack>
          {error ? (
            <Text fontSize="sm" color="red.500">
              {error}
            </Text>
          ) : null}
          <Button
            bg="blue.600"
            color="white"
            _hover={{ bg: "blue.700" }}
            size="lg"
            type="submit"
            loading={isLoading}
          >
            Register
          </Button>
        </Stack>
      </form>
      <Text fontSize="sm" color="gray.600">
        Already have an account?{" "}
        <Link asChild color="blue.600">
          <RouterLink to="/login">Login</RouterLink>
        </Link>
      </Text>
    </AuthShell>
  );
}

export default RegisterPage;
