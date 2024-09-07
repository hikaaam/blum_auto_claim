import { game_url, headers } from "./config";
export interface iBalance {
  availableBalance: string;
  playPasses: number;
  isFastFarmingEnabled: boolean;
  timestamp: number;
}

const user_path = "user/balance";

export const getBalance = async (token: string) => {
  const result = await fetch(game_url + user_path, {
    headers: {
      ...headers,
      authorization: "Bearer " + token,
    },
    method: "GET",
  });
  const jsonRes: iBalance = await result.json();
  return jsonRes;
};
