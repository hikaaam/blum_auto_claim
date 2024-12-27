import { headers } from "./config";
const url = "https://earn-domain.blum.codes/api/v1/";
const task_path_url = "tasks";

export interface SubSection {
  title: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  kind: string;
  type:
    | "SOCIAL_SUBSCRIPTION"
    | "SOCIAL_MEDIA_CHECK"
    | "WALLET_CONNECTION"
    | "PROGRESS_TARGET"
    | "APPLICATION_LAUNCH"
    | "GROUP";
  status: "NOT_STARTED" | "FINISHED" | "READY_FOR_CLAIM";
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
  subTasks: SubTask[];
  isShared: boolean;
  sharingDescription: string;
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
  const jsonResponse = (await response.json()) as iGetYourTask[];

  return jsonResponse;
};

interface iStartTask {
  id: string;
  kind: string;
  type:
    | "SOCIAL_SUBSCRIPTION"
    | "SOCIAL_MEDIA_CHECK"
    | "WALLET_CONNECTION"
    | "PROGRESS_TARGET"
    | "APPLICATION_LAUNCH";
  status: "NOT_STARTED" | "FINISHED" | "READY_FOR_CLAIM";
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
    return null;
  }

  const jsonResponse = (await response.json()) as iclaimYourTask;
  return jsonResponse;
};

export interface iGetYourTask {
  sectionType: string;
  tasks: Task[];
  subSections: SubSection[];
  title?: string;
}

export interface SubTask {
  id: string;
  kind: string;
  type:
    | "SOCIAL_SUBSCRIPTION"
    | "SOCIAL_MEDIA_CHECK"
    | "WALLET_CONNECTION"
    | "PROGRESS_TARGET"
    | "APPLICATION_LAUNCH"
    | "GROUP";
  status: "NOT_STARTED" | "FINISHED" | "READY_FOR_CLAIM";
  validationType: string;
  iconFileKey: string;
  title: string;
  productName: null;
  reward: string;
  socialSubscription: SocialSubscription;
  isDisclaimerRequired: boolean;
  subTasks: SubTask[];
  progressTarget?: ProgressTarget;
}

interface SocialSubscription {
  openInTelegram: boolean;
  url: string;
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
