#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {EsaClient} from "esa-api-client"
import { z } from "zod";
if (!process.env.ESA_API_TOKEN || !process.env.ESA_TEAM_NAME) {
    console.error("Please set ESA_API_TOKEN and ESA_TEAM_NAME environment variables.");
    process.exit(1);
}

const esa = new EsaClient({
    token: process.env.ESA_API_TOKEN,
    teamName: process.env.ESA_TEAM_NAME, 
});
 
// Create server instance
const server = new McpServer({
    name: "esa",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

function extractPostNumber(path: string): number {
    const match = path.match(/^\/posts\/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
}

// Register "get_current_time" tools
server.tool(
    "search_esa_posts",
    "Search for posts within esa",
    { searchParams: z.string().describe("Query parameters for searching within esa") },
    async ({searchParams}) => {
        const posts = await esa.getPosts({q: encodeURI(searchParams.replace(' ', '+'))})
        return {
            content: posts.posts.map((post) => ({
                type: "text",
                text: `${post.name} (${post.full_name}) \n${post.wip ? "WIP" : "Published"}\n${post.body_md}`,
            })),
        };
    },
);

server.tool("get_latest_esa_posts", "Get ESA posts", {}, async () => {
    const posts = await esa.getPosts({
        page: 1,
        per_page: 5,
    });
    
    return {
        content: posts.posts.map((post) => {
            return {
                type: "text",
                text: `${post.name} (${post.full_name}) \n${post.wip ? "WIP" : "Published"}\n${post.body_md}`,
            };
        })
    };
})

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Esa MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});