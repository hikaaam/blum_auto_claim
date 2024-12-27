import { getBalance } from "./src/accounts";
import { claimFarming, startFarming } from "./src/farming";
import { claimGame, playGame } from "./src/games";
import { Login } from "./src/login";
import { checkRewards } from "./src/rewards";
import {
  claimYourTask,
  getTasks,
  type iGetYourTask,
  startYourTask,
  type SubSection,
  type SubTask,
  type Task,
} from "./src/tasks";

const accountRaw = Bun.file("./accounts.json");
const accounts: string[] = await accountRaw.json();

const doYourTasks = async (tasks: iGetYourTask[], token: string) => {
  console.log(
    "\n\ncheck if you have any claimable tasks, topLevelTask:" +
      (tasks?.length ?? 0),
  );

  const checkForClaim = async (title: string, id: string, status: string) => {
    if (status === "READY_FOR_CLAIM") {
      console.log(`Task ${title} is started`);
      const claimRes = await claimYourTask({ token, id });
      if (claimRes) {
        console.log(
          `Task ${claimRes?.title} is finish, you get your reward : ${claimRes?.reward}`,
        );
      }
    }
  };

  const oneHellOFALoops = async (task: SubTask[] | Task[]) => {
    for (let i = 0; i < task.length; i++) {
      const { id, status, type, title, ...theRestTask } = task[i];
      console.log(
        `:::${title}::: status: ${status}, type:${type}, ${
          theRestTask?.progressTarget?.target
            ? "target:" + theRestTask?.progressTarget?.target + ","
            : ""
        }  subTasksTotal:${theRestTask?.subTasks?.length ?? 0}`,
      );
      await checkForClaim(title, id, status);
      if (theRestTask?.subTasks?.length > 1) {
        await oneHellOFALoops(theRestTask?.subTasks);
      }
      if (
        status === "NOT_STARTED" &&
        (type === "SOCIAL_SUBSCRIPTION" || type == "SOCIAL_MEDIA_CHECK")
      ) {
        const started = await startYourTask({ token, id });
        if (started) {
          console.log(`Task ${started.title} is started`);
          const claimRes = await claimYourTask({ token, id });
          if (claimRes) {
            console.log(
              `Task ${claimRes?.title} is finish, you get your reward : ${claimRes?.reward}`,
            );
          }
        }
      }
    }
  };

  const subSectionsLoops = async (subSections: SubSection[]) => {
    for (let i = 0; i < subSections.length; i++) {
      const section = subSections[i];
      console.log("\n--------------------------------------------------");
      console.log(
        `Section of ${section?.title}, totalTasks:${
          section?.tasks?.length ?? 0
        }`,
      );
      console.log("--------------------------------------------------");
      const sectionTasks = section?.tasks ?? [];
      await oneHellOFALoops(sectionTasks);
    }
  };

  for (let t = 0; t < tasks.length; t++) {
    console.log("\n--------------------------------------------------");
    console.log(
      `\n\n\nChecking For SectionType of ${tasks[t]?.sectionType}, Tasks:${
        tasks[t]?.tasks?.length ?? 0
      }, Sections:${tasks[t]?.subSections?.length ?? 0}`,
    );
    console.log("--------------------------------------------------");
    const subTasks = tasks[t]?.tasks ?? [];
    const sections = tasks[t]?.subSections ?? [];
    await oneHellOFALoops(subTasks);
    await subSectionsLoops(sections);
  }
};

const mainFunction = async () => {
  for (let index = 0; index < accounts.length; index++) {
    const account = accounts[index];
    const loginResp = await Login(account);
    console.log({ loginResp });

    if (loginResp == null) return;
    const {
      token: { access, user },
    } = loginResp;
    console.log(
      `\n\n\n\n\n\n----------------------------------------------------\n\nsuccesfull login for user : ${user.username}\n\n`,
    );
    const rewards = await checkRewards(access);
    console.log("try to claim daily reward");
    if (!rewards) {
      console.log("wait for the next day to claim daily reward");
    } else {
      console.log(`You have claimed your daily rewards`);
    }
    const { availableBalance, playPasses } = await getBalance(access);
    console.log(
      `\n\ntry checking your account\nYour Before Balance is : B.${availableBalance}\nyour game ticket is : ${playPasses}`,
    );

    const { startTime, endTime, earningsRate } = await startFarming({
      token: access,
    });
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    console.log(
      `\n\nFarming for account ${user.username} has started with \n startDate : ${startDate.toLocaleString()}\n endDate : ${endDate.toLocaleString()} \n earningsRate : ${earningsRate}`,
    );

    const isClaimSuccess = await claimFarming({ token: access });
    if (isClaimSuccess) {
      console.log(`Finish Claiming your farm`);
    }

    const myTask = await getTasks(access);
    await doYourTasks(myTask, access);
    console.log(
      "\n\nNOTE : AUTOMATIC GAME FEATURE IS NOT WORKING DUE TO PROGRAMMER UNABLE TO CRACK ENCRYPTION",
    );
    console.log("PLEASE MANUALLY RUN YOUR GAME");

    // if (playPasses > 0) {
    //   const playpassesarr = new Array(playPasses).fill(0) as number[];
    //   for (const _ in playpassesarr) {
    //     const { gameId } = await playGame(access);
    //     console.log(`game started with game id of : (${gameId})`);
    //     await waitForGameFinish(35, access, gameId);
    //   }
    // }
    const b = await getBalance(access);
    console.log(
      `\n\ntry checking your account(${user.username})\nYour After Balance is : B.${b.availableBalance}\nyour game ticket is : ${b.playPasses}`,
    );
  }
};

mainFunction();

async function waitForGameFinish(
  seconds: number,
  token: string,
  gameId: string,
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
            `game id ${gameId} is finished with points : ${res.points}`,
          );
        });
        // const { availableBalance, playPasses } = await
        getBalance(token).then(({ availableBalance, playPasses }) => {
          console.log(
            `\n\ntry checking your account\nYour Balance is : B.${availableBalance}\nyour game ticket is : ${playPasses}`,
          );
        });
      }
    }, 1000);
  });
}
