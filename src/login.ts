import { headers, url } from "./config";

export interface iLogin {
  token: Token;
  justCreated: boolean;
}

interface Token {
  access: string;
  refresh: string;
  user: User;
}

interface User {
  id: Id;
  username: string;
}

interface Id {
  id: string;
}

const loginPath = "auth/provider/PROVIDER_TELEGRAM_MINI_APP";

export const Login = async (account: string) => {
  const result = await fetch(url + loginPath, {
    headers,
    body: JSON.stringify({
      query: account,
    }),
    method: "POST",
  });
  const jsonRes: iLogin = await result.json();
  return jsonRes;
};
