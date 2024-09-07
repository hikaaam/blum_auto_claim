import { headers, game_url as url } from "./config";
const task_path_url = "tasks";

export interface iTask {
  tasks: any[];
  subSections: SubSection[];
}

interface SubSection {
  title: string;
  tasks: Task[];
}

interface Task {
  id: string;
  kind: string;
  type: "SOCIAL_SUBSCRIPTION" | "WALLET_CONNECTION" | "PROGRESS_TARGET";
  status: "NOT_STARTED" | "FINISHED";
  validationType: string;
  iconFileKey: string;
  bannerFileKey: null;
  title: string;
  productName: null;
  description: null;
  reward: string;
  socialSubscription?: SocialSubscription;
  isHidden: boolean;
  isDisclaimerRequired: boolean;
  progressTarget?: ProgressTarget;
}

interface ProgressTarget {
  target: string;
  progress: string;
  accuracy: number;
  postfix: string;
}

interface SocialSubscription {
  openInTelegram: boolean;
  url: string;
}
export const getTasks = async (token: string) => {
  const response = await fetch(url + task_path_url, {
    headers: {
      ...headers,
      authorization: "Bearer " + token,
    },
  });
  const jsonResponse = (await response.json()) as iTask[];
  return jsonResponse?.[0];
};

interface iStartTask {
  id: string;
  kind: string;
  type: "SOCIAL_SUBSCRIPTION" | "WALLET_CONNECTION" | "PROGRESS_TARGET";
  status: string;
  validationType: string;
  iconFileKey: string;
  bannerFileKey: null;
  title: string;
  productName: null;
  description: null;
  reward: string;
  socialSubscription: SocialSubscription;
  isHidden: boolean;
  isDisclaimerRequired: boolean;
}

interface SocialSubscription {
  openInTelegram: boolean;
  url: string;
}

export const startYourTask = async ({
  token,
  id,
}: {
  token: string;
  id: string;
}) => {
  const response = await fetch(`${url}${task_path_url}/${id}/start`, {
    headers: {
      ...headers,
      authorization: "Bearer " + token,
    },
    method: "POST",
  });
  if (response.status != 200) {
    console.log({ response });
  }

  const jsonResponse = (await response.json()) as iStartTask;
  return jsonResponse;
};

interface iclaimYourTask {
  id: string;
  kind: string;
  type: string;
  status: string;
  validationType: string;
  iconFileKey: string;
  bannerFileKey: null;
  title: string;
  productName: null;
  description: null;
  reward: string;
  socialSubscription: SocialSubscription;
  isHidden: boolean;
  isDisclaimerRequired: boolean;
}

interface SocialSubscription {
  openInTelegram: boolean;
  url: string;
}

export const claimYourTask = async ({
  token,
  id,
}: {
  token: string;
  id: string;
}) => {
  const response = await fetch(`${url}${task_path_url}/${id}/claim`, {
    headers: {
      ...headers,
      authorization: "Bearer " + token,
    },
    method: "POST",
  });
  if (response.status != 200) {
    console.log({ response });
  }

  const jsonResponse = (await response.json()) as iclaimYourTask;
  return jsonResponse;
};
