// src/config.gs
var url = "https://user-domain.blum.codes/api/v1/";
var game_url = "https://game-domain.blum.codes/api/v1/";
var earn_url = "https://earn-domain.blum.codes/api/v1/";

  var accounts = [
]

var headers = {
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/json",
  origin: "https://telegram.blum.codes",
  priority: "u=0",
  "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "Windows",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "TE": "trailers",
}

// src/accounts.gs
function getBalance(token) {
  var user_path = "user/balance";
  var options = {
    method: "get",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token })
  };
  try{
  
      var result = UrlFetchApp.fetch(game_url + user_path, options);
      return JSON.parse(result.getContentText());
  } catch(e){
     Logger.log("error : " + e.message )
    return {
        availableBalance: "error",
        playPasses: 0,
        isFastFarmingEnabled: false,
        timestamp: ""
    }
  }
x
}

// src/farming.gs
function startFarming(token) {
  var farming_path = "farming/start";
  var options = {
    method: "post",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token })
  };
  try{
    var result = UrlFetchApp.fetch(game_url + farming_path, options);
    return JSON.parse(result.getContentText());
  }catch(e){
    return false;
  }

}

function claimFarming(token) {
  var farming_path = "farming/claim";
  var options = {
    method: "post",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token })
  };
  try{
    var result = UrlFetchApp.fetch(game_url + farming_path, options);
    return result.getResponseCode() === 200;
  } catch(e){
    return false
  }
}

// src/games.gs
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function playGame(token) {
  var game_path = "game/play";
  var options = {
    method: "post",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token })
  };
  var result = UrlFetchApp.fetch(game_url + game_path, options);
  return JSON.parse(result.getContentText());
}

function claimGame(token, gameId) {
  var points = getRndInteger(239, 250);
  var game_path = "game/claim";
  var options = {
    method: "post",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token }),
    payload: JSON.stringify({ gameId: gameId, points: points })
  };
  var result = UrlFetchApp.fetch(game_url + game_path, options);
  return {
    points: points,
    msg: result.getContentText()
  };
}

// src/login.gs
function login(account) {
  var loginPath = "auth/provider/PROVIDER_TELEGRAM_MINI_APP";
  var options = {
    method: "post",
    headers: headers,
    payload: JSON.stringify({
      query: account
    })
  };
  var result = UrlFetchApp.fetch(url + loginPath, options);
  return JSON.parse(result.getContentText());
}

// src/rewards.gs
function checkRewards(token) {
  var path = "daily-reward?offset=-420";
  var options = {
    method: "POST",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token })
  };
  try{
  var result = UrlFetchApp.fetch("https://game-domain.blum.codes/api/v2/daily-reward", options);
    if (result.getResponseCode() !== 200) {
      return false;
    }
    return JSON.parse(result.getContentText());
  } catch(e){
    return false;
  }
 
}

// src/tasks.gs
function getTasks(token) {
  var task_path_url = "tasks";
  var options = {
    method: "get",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token })
  };
  var result = UrlFetchApp.fetch(earn_url + task_path_url, options);
  return JSON.parse(result.getContentText());
}

function startYourTask(token, id) {
  var task_path_url = "tasks/" + id + "/start";
  var options = {
    method: "post",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token })
  };
  var result = UrlFetchApp.fetch(earn_url + task_path_url, options);
  return JSON.parse(result.getContentText());
}

function claimYourTask(token, id) {
  var task_path_url = "tasks/" + id + "/claim";
  var options = {
    method: "post",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token })
  };
  var result = UrlFetchApp.fetch(earn_url + task_path_url, options);
  return JSON.parse(result.getContentText());
}

// index.gs
function waitForGameFinish(seconds, token, gameId) {
  for (var i = seconds;i>0;i--){
    Utilities.sleep(1000); // Synchronous wait
    Logger.log("game id " + gameId + " is running : " + i+"s");
  }
  var claimResult = claimGame(token, gameId);
  Logger.log("game id " + gameId + " is finished with points : " + claimResult.points);
}

function doYourTasks(tasks, token) {
  Logger.log("\n\ncheck if you have any claimable tasks, topLevelTask:" + (tasks?.length ?? 0));
  const checkForClaim = async (title, id, status) => {
    if (status === "READY_FOR_CLAIM") {
      Logger.log(`Task ${title} is started`);
      const claimRes = claimYourTask(token,id);
      if (claimRes) {
        Logger.log(`Task ${claimRes?.title} is finish, you get your reward : ${claimRes?.reward}`);
      }
    }
  };
  const oneHellOFALoops = async (task,token) => {
    for (let i = 0;i < task.length; i++) {
      const { id, status, type, title, ...theRestTask } = task[i];
      Logger.log(`:::${title}::: status: ${status}, type:${type}, ${theRestTask?.progressTarget?.target ? "target:" + theRestTask?.progressTarget?.target + "," : ""}  subTasksTotal:${theRestTask?.subTasks?.length ?? 0}`);
      checkForClaim(title, id, status);
      if (theRestTask?.subTasks?.length > 1) {
        oneHellOFALoops(theRestTask?.subTasks);
      }
      if (status === "NOT_STARTED" && (type === "SOCIAL_SUBSCRIPTION" || type == "SOCIAL_MEDIA_CHECK")) {
        const started = startYourTask(token,id);
        if (started) {
          Logger.log(`Task ${started.title} is started`);
          const claimRes = claimYourTask(token,id);
          if (claimRes) {
            Logger.log(`Task ${claimRes?.title} is finish, you get your reward : ${claimRes?.reward}`);
          }
        }
      }
    }
  };
  const subSectionsLoops = async (subSections) => {
    for (let i = 0;i < subSections.length; i++) {
      const section = subSections[i];
      Logger.log("\n--------------------------------------------------");
      Logger.log(`Section of ${section?.title}, totalTasks:${section?.tasks?.length ?? 0}`);
      Logger.log("--------------------------------------------------");
      const sectionTasks = section?.tasks ?? [];
      oneHellOFALoops(sectionTasks);
    }
  };
  for (let t = 0;t < tasks.length; t++) {
    Logger.log("\n--------------------------------------------------");
    Logger.log(`\n\n\nChecking For SectionType of ${tasks[t]?.sectionType}, Tasks:${tasks[t]?.tasks?.length ?? 0}, Sections:${tasks[t]?.subSections?.length ?? 0}`);
    Logger.log("--------------------------------------------------");
    const subTasks = tasks[t]?.tasks ?? [];
    const sections = tasks[t]?.subSections ?? [];
    oneHellOFALoops(subTasks);
    subSectionsLoops(sections);
  }
}

function mainFunction() {
  for (var index = 0; index < accounts.length; index++) {
    var account = accounts[index];
    var loginResult = login(account);
    var access = loginResult.token.access;
    var user = loginResult.token.user;
    
    Logger.log("\n\n\n\n\n\n\n----------------------------------------------------------------------------------------\n\n\nSuccessful login for user: " + user.username + "\n\n");
    Logger.log("\n\ntoken: " + access + "\n\n");

    var rewards = checkRewards(access);
    Logger.log("Try to claim daily reward");
    if (!rewards) {
      Logger.log("Wait for the next day to claim daily reward");
    } else {
      Logger.log("You have claimed your daily rewards");
    }

    var balanceData = getBalance(access);
    Logger.log("\n\nCheck your account\nYour before Balance is: B." + balanceData.availableBalance + "\nYour game ticket is: " + balanceData.playPasses);

    var farmingData = startFarming(access);
    var startDate = new Date(farmingData.startTime);
    var endDate = new Date(farmingData.endTime);
    Logger.log("\n\nFarming for account " + user.username + " has started with \nStartDate: " + startDate.toLocaleString() + "\nEndDate: " + endDate.toLocaleString() + "\nEarnings Rate: " + farmingData.earningsRate);

    if (claimFarming(access)) {
      Logger.log("Finished claiming your farm");
      var farmingData = startFarming(access);
      var startDate = new Date(farmingData.startTime);
      var endDate = new Date(farmingData.endTime);
      Logger.log("\n\nFarming for account " + user.username + " has started with \nStartDate: " + startDate.toLocaleString() + "\nEndDate: " + endDate.toLocaleString() + "\nEarnings Rate: " + farmingData.earningsRate);
    }

    var getTasksRes = getTasks(access);
    doYourTasks(getTasksRes, access);
    Logger.log("\n\nNOTE : AUTOMATIC GAME FEATURE IS NOT WORKING DUE TO PROGRAMMER UNABLE TO CRACK ENCRYPTION");
    Logger.log("PLEASE MANUALLY RUN YOUR GAME");
    // if (balanceData.playPasses > 0) {
    //   for (var i = 0; i < balanceData.playPasses; i++) {
    //     var gameResult = playGame(access);
    //     Logger.log("Game started with game id: (" + gameResult.gameId + ")");
    //     waitForGameFinish(35, access, gameResult.gameId);
    //   }
    // } else{
    //   Logger.log("\n\nNot Enough play passes");
    // }
    var balanceData = getBalance(access);
    Logger.log("\n\nCheck your account\nYour after Balance is: B." + balanceData.availableBalance + "\nYour game ticket is: " + balanceData.playPasses);
  }

}
