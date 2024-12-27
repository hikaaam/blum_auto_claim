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
  const result = await fetch(
    "https://game-domain.blum.codes/api/v2/daily-reward",
    {
      headers: {
        ...headers,
        authorization: "Bearer " + token,
      },
      method: "POST",
    },
  );

  if (result.status != 200) {
    return false;
  }
  const jsonRes: iDailyReward = await result.json();
  return jsonRes;
};
