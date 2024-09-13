// src/config.gs
var url = "https://user-domain.blum.codes/api/v1/";
var game_url = "https://game-domain.blum.codes/api/v1/";
var earn_url = "https://earn-domain.blum.codes/api/v1/";

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
    method: "get",
    headers: Object.assign({}, headers, { authorization: "Bearer " + token })
  };
  try{
  var result = UrlFetchApp.fetch(game_url + path, options);
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
  return JSON.parse(result.getContentText())[0];
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
  Logger.log("\n\nCheck if you have any claimable tasks");
    for (var index = 0; index < tasks?.tasks?.length ?? 0; index++) {
    var taskList = tasks?.tasks?.[index].subTasks ?? [];
    for (var i = 0; i < taskList.length; i++) {
      var task = taskList[i];
      if (task.status === "NOT_STARTED" && (task.type === "SOCIAL_SUBSCRIPTION" || task.type === "SOCIAL_MEDIA_CHECK")) {
        var started = startYourTask(token, task.id);
        if (started) {
          Logger.log("Task " + started.title + " is started");
          var reward = claimYourTask(token, task.id).reward;
          Logger.log("Task " + started.title + " is finished, you get your reward: " + reward);
        }
      }
    }
  }

  for (var index = 0; index < tasks?.subSections?.length ?? 0; index++) {
    var taskList = tasks?.subSections?.[index]?.tasks ?? [];
    for (var i = 0; i < taskList.length; i++) {
      var task = taskList[i];
      if (task.status === "NOT_STARTED" && (task.type === "SOCIAL_SUBSCRIPTION" || task.type === "SOCIAL_MEDIA_CHECK")) {
        var started = startYourTask(token, task.id);
        if (started) {
          Logger.log("Task " + started.title + " is started");
          var reward = claimYourTask(token, task.id).reward;
          Logger.log("Task " + started.title + " is finished, you get your reward: " + reward);
        }
      }
    }
  }
}

function mainFunction() {
  var accounts = []
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

    var tasks = getTasks(access);
    doYourTasks(tasks, access);

    Logger.log("\n\nTry playing your game");
    if (balanceData.playPasses > 0) {
      for (var i = 0; i < 10; i++) {
        var gameResult = playGame(access);
        Logger.log("Game started with game id: (" + gameResult.gameId + ")");
        waitForGameFinish(35, access, gameResult.gameId);
      }
    } else{
      Logger.log("\n\nNot Enough play passes");
    }
    var balanceData = getBalance(access);
    Logger.log("\n\nCheck your account\nYour after Balance is: B." + balanceData.availableBalance + "\nYour game ticket is: " + balanceData.playPasses);
  }

}
