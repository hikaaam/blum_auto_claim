import { getBalance } from "./src/accounts";
import { claimFarming, startFarming } from "./src/farming";
import { claimGame, playGame } from "./src/games";
import { Login } from "./src/login";
import { checkRewards } from "./src/rewards";
import {
  claimYourTask,
  getTasks,
  startYourTask,
  type iTask,
} from "./src/tasks";

const accountRaw = Bun.file("./accounts.json");
const accounts: string[] = await accountRaw.json();

const doYourTasks = async (tasks: iTask, token: string) => {
  console.log("\n\ncheck if you have any claimable tasks");
  for (let index = 0; index < tasks.tasks.length; index++) {
    const task = tasks?.tasks?.[index]?.subTasks ?? [];

    for (let i = 0; i < task.length; i++) {
      const { id, status, type } = task[i];
      if (status === "NOT_STARTED" && type === "SOCIAL_SUBSCRIPTION") {
        const started = await startYourTask({ token, id });
        if (started) {
          console.log(`Task ${started.title} is started`);
          const { reward } = await claimYourTask({ token, id });
          console.log(
            `Task ${started.title} is finish, you get your reward : ${reward}`
          );
        }
      }
    }
  }

  for (let index = 0; index < tasks.subSections.length; index++) {
    const task = tasks?.subSections?.[index]?.tasks;

    for (let i = 0; i < task.length; i++) {
      const { id, status, type } = task?.[i];
      if (status === "NOT_STARTED" && type === "SOCIAL_SUBSCRIPTION") {
        const started = await startYourTask({ token, id });
        if (started) {
          console.log(`Task ${started.title} is started`);
          const { reward } = await claimYourTask({ token, id });
          console.log(
            `Task ${started.title} is finish, you get your reward : ${reward}`
          );
        }
      }
    }
  }
};

const mainFunction = async () => {
  for (let index = 0; index < accounts.length; index++) {
    const account = accounts[index];
    const {
      token: { access, user },
    } = await Login(account);
    console.log(`\n\nsuccesfull login for user : ${user.username}\n\n`);
    const rewards = await checkRewards(access);
    console.log("try to claim daily reward");
    if (!rewards) {
      console.log("wait for the next day to claim daily reward");
    } else {
      console.log(`You have claimed your daily rewards`);
    }
    const { availableBalance, playPasses } = await getBalance(access);
    console.log(
      `\n\ntry checking your account\nYour Balance is : B.${availableBalance}\nyour game ticket is : ${playPasses}`
    );

    const { startTime, endTime, earningsRate } = await startFarming({
      token: access,
    });
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    console.log(
      `\n\nFarming for account ${
        user.username
      } has started with \n startDate : ${startDate.toLocaleString()}\n endDate : ${endDate.toLocaleString()} \n earningsRate : ${earningsRate}`
    );

    const isClaimSuccess = await claimFarming({ token: access });
    if (isClaimSuccess) {
      console.log(`Finish Claiming your farm`);
    }

    const myTask = await getTasks(access);
    await doYourTasks(myTask, access);
    console.log("\n\n try playing your game");

    if (playPasses > 0) {
      const playpassesarr = new Array(playPasses).fill(0) as number[];
      for (const _ in playpassesarr) {
        const { gameId } = await playGame(access);
        console.log(`game started with game id of : (${gameId})`);
        await waitForGameFinish(35, access, gameId);
      }
    }
  }
};

mainFunction();

async function waitForGameFinish(
  seconds: number,
  token: string,
  gameId: string
) {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      console.log(`waiting for gameid (${gameId}) timer : ${seconds}s`);
      seconds--;
      if (seconds <= 0) {
        clearInterval(intervalId);
        resolve(true);
        claimGame(token, gameId).then((res) => {
          console.log(
            `game id ${gameId} is finished with points : ${res.points}`
          );
        });
        // const { availableBalance, playPasses } = await
        getBalance(token).then(({ availableBalance, playPasses }) => {
          console.log(
            `\n\ntry checking your account\nYour Balance is : B.${availableBalance}\nyour game ticket is : ${playPasses}`
          );
        });
      }
    }, 1000);
  });
}
