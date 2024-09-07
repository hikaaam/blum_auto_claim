// @bun
// src/config.ts
var url = "https://user-domain.blum.codes/api/v1/";
var game_url = "https://game-domain.blum.codes/api/v1/";
var headers = {
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/json",
  origin: "https://telegram.blum.codes",
  priority: "u=1, i",
  "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "Windows",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
};

// src/accounts.ts
var user_path = "user/balance";
var getBalance = async (token) => {
  const result = await fetch(game_url + user_path, {
    headers: {
      ...headers,
      authorization: "Bearer " + token
    },
    method: "GET"
  });
  const jsonRes = await result.json();
  return jsonRes;
};

// src/farming.ts
var farming_path = "farming/";
var startFarming = async ({ token }) => {
  const response = await fetch(`${game_url}${farming_path}start`, {
    headers: {
      ...headers,
      authorization: "Bearer " + token
    },
    method: "POST"
  });
  const jsonResponse = await response.json();
  return jsonResponse;
};
var claimFarming = async ({ token }) => {
  const response = await fetch(`${game_url}${farming_path}claim`, {
    headers: {
      ...headers,
      authorization: "Bearer " + token
    },
    method: "POST"
  });
  if (response.status == 200) {
    return true;
  } else {
    return false;
  }
};

// src/games.ts
var getRndInteger = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
var game_path = "game/";
var playGame = async (token) => {
  const result = await fetch(game_url + game_path + "play", {
    headers: {
      ...headers,
      authorization: "Bearer " + token
    },
    method: "POST"
  });
  const jsonRes = await result.json();
  return jsonRes;
};
var claimGame = async (token, gameId) => {
  const points = getRndInteger(239, 250);
  const result = await fetch(game_url + game_path + "claim", {
    headers: {
      ...headers,
      authorization: "Bearer " + token
    },
    method: "POST",
    body: JSON.stringify({
      gameId,
      points
    })
  });
  const jsonRes = await result.text();
  return {
    points,
    msg: jsonRes
  };
};

// src/login.ts
var loginPath = "auth/provider/PROVIDER_TELEGRAM_MINI_APP";
var Login = async (account) => {
  const result = await fetch(url + loginPath, {
    headers,
    body: JSON.stringify({
      query: account
    }),
    method: "POST"
  });
  const jsonRes = await result.json();
  return jsonRes;
};

// src/rewards.ts
var path = "daily-reward?offset=-420";
var checkRewards = async (token) => {
  const result = await fetch(game_url + path, {
    headers: {
      ...headers,
      authorization: "Bearer " + token
    },
    method: "GET"
  });
  if (result.status != 200) {
    return false;
  }
  const jsonRes = await result.json();
  return jsonRes;
};

// src/tasks.ts
var task_path_url = "tasks";
var getTasks = async (token) => {
  const response = await fetch(game_url + task_path_url, {
    headers: {
      ...headers,
      authorization: "Bearer " + token
    }
  });
  const jsonResponse = await response.json();
  return jsonResponse?.[0];
};
var startYourTask = async ({
  token,
  id
}) => {
  const response = await fetch(`${game_url}${task_path_url}/${id}/start`, {
    headers: {
      ...headers,
      authorization: "Bearer " + token
    },
    method: "POST"
  });
  if (response.status != 200) {
    console.log({ response });
  }
  const jsonResponse = await response.json();
  return jsonResponse;
};
var claimYourTask = async ({
  token,
  id
}) => {
  const response = await fetch(`${game_url}${task_path_url}/${id}/claim`, {
    headers: {
      ...headers,
      authorization: "Bearer " + token
    },
    method: "POST"
  });
  if (response.status != 200) {
    console.log({ response });
  }
  const jsonResponse = await response.json();
  return jsonResponse;
};

// index.ts
async function waitForGameFinish(seconds, token, gameId) {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      console.log(`waiting for gameid (${gameId}) timer : ${seconds}s`);
      seconds--;
      if (seconds <= 0) {
        clearInterval(intervalId);
        resolve(true);
        claimGame(token, gameId).then((res) => {
          console.log(`game id ${gameId} is finished with points : ${res.points}`);
        });
      }
    }, 1000);
  });
}
var accountRaw = Bun.file("./accounts.json");
var accounts2 = await accountRaw.json();
var doYourTasks = async (tasks2, token) => {
  console.log("\n\ncheck if you have any claimable tasks");
  for (let index = 0;index < tasks2.subSections.length; index++) {
    const task = tasks2.subSections[index].tasks;
    for (let i = 0;i < task.length; i++) {
      const { id, status, type } = task[i];
      if (status === "NOT_STARTED" && type === "SOCIAL_SUBSCRIPTION") {
        const started = await startYourTask({ token, id });
        if (started) {
          console.log(`Task ${started.title} is started`);
          const { reward } = await claimYourTask({ token, id });
          console.log(`Task ${started.title} is finish, you get your reward : ${reward}`);
        }
      }
    }
  }
};
var mainFunction = async () => {
  for (let index = 0;index < accounts2.length; index++) {
    const account = accounts2[index];
    const {
      token: { access, user }
    } = await Login(account);
    console.log(`\n\nsuccesfull login for user : ${user.username}\n\n`);
    const rewards2 = await checkRewards(access);
    console.log("try to claim daily reward");
    if (!rewards2) {
      console.log("wait for the next day to claim daily reward");
    } else {
      console.log(`You have claimed your daily rewards`);
    }
    const { availableBalance, playPasses } = await getBalance(access);
    console.log(`\n\ntry checking your account\nYour Balance is : B.${availableBalance}\nyour game ticket is : ${playPasses}`);
    const { startTime, endTime, earningsRate } = await startFarming({
      token: access
    });
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    console.log(`\n\nFarming for account ${user.username} has started with \n startDate : ${startDate.toLocaleString()}\n endDate : ${endDate.toLocaleString()} \n earningsRate : ${earningsRate}`);
    const isClaimSuccess = await claimFarming({ token: access });
    if (isClaimSuccess) {
      console.log(`Finish Claiming your farm`);
    }
    const myTask = await getTasks(access);
    await doYourTasks(myTask, access);
    console.log("\n\n try playing your game");
    if (playPasses > 0) {
      const playpassesarr = new Array(playPasses).fill(0);
      for (const _ in playpassesarr) {
        const { gameId } = await playGame(access);
        console.log(`game started with game id of : (${gameId})`);
        await waitForGameFinish(35, access, gameId);
      }
    }
  }
};
mainFunction();
