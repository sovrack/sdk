# Sovrack SDK (`@sovrack/sdk`)

Official TypeScript & JavaScript client for interacting programmatically with the **Sovrack** API.

## 📦 Installation

```bash
npm install @sovrack/sdk
```

## 🚀 Quickstart

```typescript
import { SovrackClient } from "@sovrack/sdk";

const sovrack = new SovrackClient({
  baseUrl: "https://api.sovrack.com",
  token: process.env.SOVRACK_API_TOKEN,
});

// List all registered servers
const servers = await sovrack.servers.list();
console.log(`Found ${servers.length} servers`);

// Trigger an automated deployment
const deployment = await sovrack.deployments.trigger({
  projectId: "proj_abc123",
  targetServer: "vps-production",
  branch: "main",
});

console.log(`Deployment ${deployment.id} initiated: status ${deployment.status}`);
```

## 📄 License

Apache-2.0
