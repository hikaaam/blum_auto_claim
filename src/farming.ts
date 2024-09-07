import { game_url, headers } from "./config";

const farming_path = "farming/";

interface iFarming {
  startTime: number;
  endTime: number;
  earningsRate: string;
  balance: string;
}

export const startFarming = async ({ token }: { token: string }) => {
  const response = await fetch(`${game_url}${farming_path}start`, {
    headers: {
      ...headers,
      authorization: "Bearer " + token,
    },
    method: "POST",
  });
  const jsonResponse = (await response.json()) as iFarming;
  return jsonResponse;
};

export const claimFarming = async ({ token }: { token: string }) => {
  const response = await fetch(`${game_url}${farming_path}claim`, {
    headers: {
      ...headers,
      authorization: "Bearer " + token,
    },
    method: "POST",
  });
  if (response.status == 200) {
    return true;
  } else {
    return false;
  }
};
