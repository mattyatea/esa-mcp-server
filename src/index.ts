import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { EsaClient, Post } from "esa-api-client"
import { z } from "zod";

if (!process.env.ESA_API_TOKEN || !process.env.ESA_TEAM_NAME) {
    console.error("Please set ESA_API_TOKEN and ESA_TEAM_NAME environment variables.");
    process.exit(1);
}

const esa = new EsaClient({
    token: process.env.ESA_API_TOKEN,
    teamName: process.env.ESA_TEAM_NAME, 
});

const server = new McpServer({
    name: "esa",
    version: "1.0.0",
});

function formatPost(post: Post): {type: "text", text: string} {
    return {
        type: "text",
        text: `${post.name} (${post.full_name}) \n${post.wip ? "WIP" : "Published"}\n${post.body_md}`,
    };
}

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Esa MCP Server running on stdio");
}

server.tool(
    "search_esa_posts",
    "Search for posts within esa",
    { searchParams: z.string().describe("Query parameters for searching within esa") },
    async ({searchParams}) => {
        const posts = await esa.getPosts({q: encodeURI(searchParams.replace(' ', '+'))})
        return {
            content: posts.posts.map((post) => 
                formatPost(post)
            ),
        };
    },
);

server.tool("get_latest_esa_posts", "Get Latest Esa Posts", {}, async () => {
    const posts = await esa.getPosts({
        page: 1,
        per_page: 5,
    });

    return {
        content: posts.posts.map((post) =>
            formatPost(post)
        ),
    };
})

server.tool("create_esa_post", "Create a new post in esa", {title: z.string().describe("Title of the post"), body: z.string().describe("Body of the post with markdown"),tags: z.array(z.string()).describe("Post tags"),category: z.string().describe("Post category")}, async ({title, body,tags,category}) => {
    const post = await esa.createPost({
        name: title,
        body_md: body,
        tags: Array.isArray(tags) ? tags : [tags],
        category: category,
        wip: true,
    });
    
    if (!post) {
        throw new Error("Failed to create post");
    }
    
    return {
        content: [{
            type: "text",
            text: `Post created: ${post.full_name}`,
        }],
    };
})

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});