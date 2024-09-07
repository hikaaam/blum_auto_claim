import { game_url, headers } from "./config";

interface iplayGames {
  gameId: string;
}
const game_path = "game/";

export const playGame = async (token: string) => {
  const result = await fetch(game_url + game_path + "play", {
    headers: {
      ...headers,
      authorization: "Bearer " + token,
    },
    method: "POST",
  });
  const jsonRes: iplayGames = await result.json();
  return jsonRes;
};

function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const claimGame = async (token: string, gameId: string) => {
  const points = getRndInteger(239, 250);
  const result = await fetch(game_url + game_path + "claim", {
    headers: {
      ...headers,
      authorization: "Bearer " + token,
    },
    method: "POST",
    body: JSON.stringify({
      gameId,
      points,
    }),
  });
  const jsonRes: string = await result.text();
  return {
    points,
    msg: jsonRes,
  };
};
