export type User = {
  nickname: string;
  token: string;
  createdAt: string;
};

const users = new Map<string, User>();

export function getUserByNickname(nickname: string): User | null {
  return users.get(nickname) ?? null;
}

export function createUser(nickname: string): User {
  const user: User = {
    nickname,
    token: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  users.set(nickname, user);
  return user;
}

export function verifyUser(nickname: string, token: string): User | null {
  const user = users.get(nickname);
  if (!user) {
    return null;
  }
  return user.token === token ? user : null;
}
