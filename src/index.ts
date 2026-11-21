export interface SovrackClientOptions {
  baseUrl: string;
  token: string;
  timeoutMs?: number;
}

export interface ServerInfo {
  id: string;
  name: string;
  ipAddress: string;
  status: "ONLINE" | "OFFLINE" | "CONFIGURING";
  cpuUsage: number;
  memoryUsageMb: number;
}

export interface DeploymentTriggerOptions {
  projectId: string;
  targetServer: string;
  branch?: string;
  commitHash?: string;
}

export interface DeploymentResult {
  id: string;
  status: "QUEUED" | "BUILDING" | "DEPLOYING" | "SUCCESS" | "FAILED";
  url?: string;
  createdAt: string;
}

export class SovrackClient {
  private baseUrl: string;
  private token: string;

  constructor(options: SovrackClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
  }

  public readonly servers = {
    list: async (): Promise<ServerInfo[]> => {
      return this.request<ServerInfo[]>("/api/v1/servers");
    },
    get: async (id: string): Promise<ServerInfo> => {
      return this.request<ServerInfo>(`/api/v1/servers/${id}`);
    },
  };

  public readonly deployments = {
    trigger: async (options: DeploymentTriggerOptions): Promise<DeploymentResult> => {
      return this.request<DeploymentResult>("/api/v1/deployments", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },
    getLogs: async (deploymentId: string): Promise<string[]> => {
      return this.request<string[]>(`/api/v1/deployments/${deploymentId}/logs`);
    },
  };

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...init?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`[Sovrack SDK] HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  }
}
