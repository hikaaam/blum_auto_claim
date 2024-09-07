import { game_url, headers } from "./config";

const path = "daily-reward?offset=-420";

interface iDailyReward {
  countInRow: number;
  days: Day[];
}

interface Day {
  ordinal: number;
  reward: Reward;
}

interface Reward {
  passes: number;
  points: string;
}

export const checkRewards = async (token: string) => {
  const result = await fetch(game_url + path, {
    headers: {
      ...headers,
      authorization: "Bearer " + token,
    },
    method: "GET",
  });
  if (result.status != 200) {
    return false;
  }
  const jsonRes: iDailyReward = await result.json();
  return jsonRes;
};
