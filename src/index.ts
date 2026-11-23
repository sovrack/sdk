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

  public readonly previews = {
    list: async (projectId: string): Promise<Array<{ id: string; prNumber: string; branch: string; url: string }>> => {
      return this.request(`/api/v1/projects/${projectId}/previews`);
    },
    teardown: async (projectId: string, prNumber: number): Promise<{ success: boolean }> => {
      return this.request(`/api/v1/projects/${projectId}/previews/${prNumber}`, {
        method: "DELETE",
      });
    },
  };

  public readonly telemetry = {
    getServerMetrics: async (serverId: string): Promise<{
      connected: boolean;
      metrics?: {
        cpuPercent: number;
        memoryUsedMb: number;
        memoryTotalMb: number;
        diskUsedGb: number;
        diskTotalGb: number;
        containers: Array<{ id: string; name: string; state: string; cpuPercent: number }>;
      };
    }> => {
      return this.request(`/servers/${serverId}/telemetry`);
    },
  };

  public readonly pitr = {
    restore: async (serviceId: string, targetTimestamp: string): Promise<{ success: boolean; message: string }> => {
      return this.request(`/services/${serviceId}/pitr-restore`, {
        method: "POST",
        body: JSON.stringify({ targetTimestamp }),
      });
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
