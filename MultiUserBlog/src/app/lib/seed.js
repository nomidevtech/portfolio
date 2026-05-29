import { db } from "@/app/lib/turso";
import { hash } from "@/app/utils/bcrypt";
import { resetDb, initAllTables } from "@/app/models/tablesInit";

// ─── Hardcoded seed data ──────────────────────────────────────────────────────

const USERS = [
    {
        public_id: "user_alice_01",
        name: "Alice Mercer",
        username: "alicemercer",
        email: "alice@inkline.dev",
        password: "Alice@1234",
        email_verified: 1,
    },
    {
        public_id: "user_ben_02",
        name: "Ben Okafor",
        username: "benokafor",
        email: "ben@inkline.dev",
        password: "Ben@12345",
        email_verified: 1,
    },
    {
        public_id: "user_clara_03",
        name: "Clara Voss",
        username: "claravoss",
        email: "clara@inkline.dev",
        password: "Clara@123",
        email_verified: 1,
    },
];

const TAXONOMIES = ["TECHNOLOGY", "DESIGN", "CULTURE", "SCIENCE"];

const TAGS = [
    "javascript",
    "nextjs",
    "css",
    "typography",
    "ux",
    "ai",
    "open-source",
    "productivity",
];

// Each post maps to: { userIndex, taxonomyIndex, tags[], title, slug, excerpt, content[] }
const POSTS = [
    {
        public_id: "post_001_abc123",
        userIndex: 0,
        taxonomyIndex: 0,
        tags: ["javascript", "nextjs", "open-source"],
        title: "Why I Switched to Next.js App Router",
        slug: "why-i-switched-to-nextjs-app-router",
        excerpt: "After months of fighting Pages Router patterns, the App Router finally clicked — here is what changed my mind.",
        content: [
            {
                type: "heading",
                value: "The mental model shift",
            },
            {
                type: "paragraph",
                value: "The App Router is not just a new folder structure — it forces you to think in terms of Server Components first. Once that clicked, everything else fell into place. Data fetching moved closer to where it was actually needed, and client bundles shrank noticeably.",
            },
            {
                type: "heading",
                value: "Layouts and nested routing",
            },
            {
                type: "paragraph",
                value: "Nested layouts alone were worth the migration. Persistent UI elements no longer required state gymnastics or context hacks — they just live in the layout file and Next.js handles the rest. Streaming and Suspense boundaries are a natural fit on top of that.",
            },
        ],
    },
    {
        public_id: "post_002_def456",
        userIndex: 1,
        taxonomyIndex: 1,
        tags: ["css", "typography", "ux"],
        title: "Variable Fonts Are Underused in 2025",
        slug: "variable-fonts-are-underused-in-2025",
        excerpt: "One font file, infinite stylistic range. Variable fonts have been well-supported for years yet most sites still ship five static weights.",
        content: [
            {
                type: "heading",
                value: "What a variable font actually is",
            },
            {
                type: "paragraph",
                value: "A variable font encodes a continuous design space — weight, width, slant, and custom axes — inside a single binary. The browser interpolates any position along those axes at render time, which means you can set font-weight to any value from 100 to 900 without loading extra files.",
            },
            {
                type: "heading",
                value: "Performance and creative gains",
            },
            {
                type: "paragraph",
                value: "Switching a typical UI to a variable font often cuts font payload by 60–80 percent. The real bonus is creative latitude: you can animate weight on hover or adjust optical size for small text without a separate typeface. Most Google Fonts are already variable — the tooling is there, designers just need to lean in.",
            },
        ],
    },
    {
        public_id: "post_003_ghi789",
        userIndex: 2,
        taxonomyIndex: 3,
        tags: ["ai", "open-source"],
        title: "Local LLMs and the End of API Lock-In",
        slug: "local-llms-and-the-end-of-api-lock-in",
        excerpt: "Running a capable language model on a laptop used to be a fantasy. In 2025 it is an afternoon project.",
        content: [
            {
                type: "heading",
                value: "Why local inference matters",
            },
            {
                type: "paragraph",
                value: "Every token you send to a hosted API is a dependency: on uptime, on pricing, on terms of service, and on latency. A locally running model eliminates all four at the cost of some hardware and setup time. For batch processing, prototyping, or privacy-sensitive workloads the trade-off is obvious.",
            },
            {
                type: "heading",
                value: "The tooling ecosystem",
            },
            {
                type: "paragraph",
                value: "Ollama made local inference genuinely approachable. Pull a model, run a single command, and you have an OpenAI-compatible API endpoint on localhost. Combine that with quantised checkpoints from Hugging Face and a mid-range laptop becomes a surprisingly capable inference box for most everyday tasks.",
            },
        ],
    },
    {
        public_id: "post_004_jkl012",
        userIndex: 0,
        taxonomyIndex: 2,
        tags: ["productivity", "open-source"],
        title: "The Case for Boring Technology",
        slug: "the-case-for-boring-technology",
        excerpt: "Choosing the latest framework is exciting. Choosing the one you can maintain alone at 2 a.m. is wise.",
        content: [
            {
                type: "heading",
                value: "Novelty is a liability",
            },
            {
                type: "paragraph",
                value: "Every new tool brings a learning curve, an immature ecosystem, and an uncertain future. Boring technology — Postgres, Redis, plain HTTP — has survived because it solves real problems well. The documentation is complete, the edge cases are known, and Stack Overflow is full of answers.",
            },
            {
                type: "paragraph",
                value: "This does not mean never adopting new things. It means weighting proven tools higher when reliability and longevity matter more than novelty. Most production systems are better off with a conservative stack and ambitious product work than the reverse.",
            },
        ],
    },
    {
        public_id: "post_005_mno345",
        userIndex: 1,
        taxonomyIndex: 0,
        tags: ["javascript", "ux", "productivity"],
        title: "Optimistic UI Patterns Without a Library",
        slug: "optimistic-ui-patterns-without-a-library",
        excerpt: "React's useOptimistic hook makes snappy interfaces achievable with no third-party state manager.",
        content: [
            {
                type: "heading",
                value: "The user expectation gap",
            },
            {
                type: "paragraph",
                value: "Users expect clicks to feel instant. A spinner on every mutation breaks that contract. Optimistic updates assume success and roll back only on error, which keeps the UI feeling responsive even over a slow connection.",
            },
            {
                type: "heading",
                value: "useOptimistic in practice",
            },
            {
                type: "paragraph",
                value: "With React's useOptimistic hook you provide an updater function that derives the next UI state from the action payload. The hook applies that state immediately while the async action runs in the background. On success nothing changes; on failure the original state is restored automatically. No library required.",
            },
        ],
    },
    {
        public_id: "post_006_pqr678",
        userIndex: 2,
        taxonomyIndex: 1,
        tags: ["css", "typography"],
        title: "Designing with a Constrained Colour Palette",
        slug: "designing-with-a-constrained-colour-palette",
        excerpt: "Three semantic colours beat thirty brand swatches every time when it comes to consistent, maintainable UI.",
        content: [
            {
                type: "heading",
                value: "Less is a system",
            },
            {
                type: "paragraph",
                value: "A colour palette that cannot be held in working memory is a palette that will be applied inconsistently. Pick a background, a foreground, an accent, and a border tone. Map them to CSS custom properties and use those names everywhere. When a designer wants to tweak the accent, one variable change propagates through the entire product.",
            },
            {
                type: "paragraph",
                value: "Semantic naming matters more than the hex values. The difference between --accent and --brand-crimson-500 is that the former communicates purpose. When dark mode arrives you remap the tokens, not the component styles.",
            },
        ],
    },
    {
        public_id: "post_007_stu901",
        userIndex: 0,
        taxonomyIndex: 3,
        tags: ["ai", "javascript"],
        title: "Embeddings Are the Quiet Revolution in Search",
        slug: "embeddings-are-the-quiet-revolution-in-search",
        excerpt: "Vector search does not replace keyword search — it complements it. Here is how to think about when to use which.",
        content: [
            {
                type: "heading",
                value: "What an embedding encodes",
            },
            {
                type: "paragraph",
                value: "An embedding turns a piece of text into a high-dimensional vector where semantic similarity maps to geometric proximity. Two sentences that mean the same thing but share no words will sit near each other in the vector space. That is something a BM25 index simply cannot do.",
            },
            {
                type: "heading",
                value: "Hybrid retrieval in practice",
            },
            {
                type: "paragraph",
                value: "The best production search systems today combine keyword recall with vector recall and rerank the merged result list. Keyword search wins on exact matches and rare terms; vector search wins on paraphrase and intent. Running both and fusing the scores gives you the strengths of each without the weaknesses of either.",
            },
        ],
    },
    {
        public_id: "post_008_vwx234",
        userIndex: 1,
        taxonomyIndex: 2,
        tags: ["productivity", "ux"],
        title: "Why Most Dashboards Are Ignored",
        slug: "why-most-dashboards-are-ignored",
        excerpt: "A dashboard that shows everything communicates nothing. The real design question is what decision this display should enable.",
        content: [
            {
                type: "heading",
                value: "The over-metrics trap",
            },
            {
                type: "paragraph",
                value: "Most dashboards are built by adding metrics, not by subtracting them. Every stakeholder request gets a chart. Over time the result is a canvas of numbers that no one checks because scanning it takes longer than the decision it is meant to support.",
            },
            {
                type: "heading",
                value: "Start with the decision",
            },
            {
                type: "paragraph",
                value: "Before laying out a single widget, ask: what action should this dashboard make obvious? Then work backwards — what is the minimum data needed to surface that signal? A well-designed dashboard is closer to a cockpit instrument than a spreadsheet. Clarity is the feature.",
            },
        ],
    },
];

const COMMENTS = [
    {
        public_id: "cmt_001",
        postPublicId: "post_001_abc123",
        userIndex: 1,
        comment: "Great write-up. The layout file approach alone saved me from a massive state management headache on my last project.",
    },
    {
        public_id: "cmt_002",
        postPublicId: "post_001_abc123",
        userIndex: 2,
        comment: "Agreed on Server Components. The hardest part was unlearning the reflex to reach for useState for everything.",
    },
    {
        public_id: "cmt_003",
        postPublicId: "post_002_def456",
        userIndex: 0,
        comment: "The performance numbers here match exactly what I saw when I migrated our marketing site. Font payload went from 320 KB down to 90 KB.",
    },
    {
        public_id: "cmt_004",
        postPublicId: "post_003_ghi789",
        userIndex: 0,
        comment: "Ollama is genuinely underrated. I have been running Mistral locally for internal tooling for three months and the latency is better than I expected.",
    },
    {
        public_id: "cmt_005",
        postPublicId: "post_004_jkl012",
        userIndex: 1,
        comment: "The 2 a.m. framing is exactly right. I have rebuilt the same feature twice because I chased a shiny new tool the first time.",
    },
    {
        public_id: "cmt_006",
        postPublicId: "post_005_mno345",
        userIndex: 2,
        comment: "useOptimistic was the thing I did not know I needed. Dropped three context providers and a custom hook after this pattern.",
    },
    {
        public_id: "cmt_007",
        postPublicId: "post_007_stu901",
        userIndex: 2,
        comment: "The hybrid retrieval point is key. Pure vector search misses too many exact-match queries. Both together is the way.",
    },
    {
        public_id: "cmt_008",
        postPublicId: "post_008_vwx234",
        userIndex: 0,
        comment: "Sent this to every PM I have ever worked with. The decision-first framing should be required reading before anyone opens Figma.",
    },
];

// User 0 favorites posts 3, 5, 7  |  User 1 favorites posts 1, 4  |  User 2 favorites posts 0, 2
const FAVORITES = [
    { userIndex: 0, postPublicId: "post_004_jkl012" },
    { userIndex: 0, postPublicId: "post_006_pqr678" },
    { userIndex: 0, postPublicId: "post_008_vwx234" },
    { userIndex: 1, postPublicId: "post_002_def456" },
    { userIndex: 1, postPublicId: "post_005_mno345" },
    { userIndex: 2, postPublicId: "post_001_abc123" },
    { userIndex: 2, postPublicId: "post_003_ghi789" },
];

// ─── Insertion helpers ────────────────────────────────────────────────────────

async function seedUsers() {
    const insertedIds = [];
    for (const u of USERS) {
        const hashedPassword = await hash(u.password);
        const result = await db.execute(
            `INSERT INTO users (public_id, name, username, email, password, email_verified)
             VALUES (?, ?, ?, ?, ?, ?)
             RETURNING id`,
            [u.public_id, u.name, u.username, u.email, hashedPassword, u.email_verified]
        );
        insertedIds.push(result.rows[0].id);
    }
    console.log(`✓ Users seeded (${insertedIds.length})`);
    return insertedIds; // index-aligned with USERS array
}

async function seedTaxonomies() {
    const insertedIds = [];
    for (const name of TAXONOMIES) {
        const result = await db.execute(
            `INSERT INTO taxonomies (name) VALUES (?) RETURNING id`,
            [name]
        );
        insertedIds.push(result.rows[0].id);
    }
    console.log(`✓ Taxonomies seeded (${insertedIds.length})`);
    return insertedIds; // index-aligned with TAXONOMIES array
}

async function seedTags() {
    const insertedIds = [];
    for (const name of TAGS) {
        const result = await db.execute(
            `INSERT INTO tags (name) VALUES (?) RETURNING id`,
            [name]
        );
        insertedIds.push(result.rows[0].id);
    }
    console.log(`✓ Tags seeded (${insertedIds.length})`);
    return insertedIds; // index-aligned with TAGS array
}

async function seedPosts(userIds, taxonomyIds, tagIds) {
    // Build lookup maps
    const taxonomyNameToId = Object.fromEntries(
        TAXONOMIES.map((name, i) => [name, taxonomyIds[i]])
    );
    const tagNameToId = Object.fromEntries(
        TAGS.map((name, i) => [name, tagIds[i]])
    );

    const postPublicIdToDbId = {};

    for (const post of POSTS) {
        // Insert post
        const result = await db.execute(
            `INSERT INTO posts (public_id, user_id, title, slug, excerpt, content)
             VALUES (?, ?, ?, ?, ?, ?)
             RETURNING id`,
            [
                post.public_id,
                userIds[post.userIndex],
                post.title,
                post.slug,
                post.excerpt,
                JSON.stringify(post.content),
            ]
        );
        const postDbId = result.rows[0].id;
        postPublicIdToDbId[post.public_id] = postDbId;

        // Link taxonomy
        const taxonomyId = taxonomyIds[post.taxonomyIndex];
        await db.execute(
            `INSERT INTO post_taxonomies (post_id, taxonomy_id) VALUES (?, ?)`,
            [postDbId, taxonomyId]
        );

        // Link tags
        for (const tagName of post.tags) {
            const tagId = tagNameToId[tagName];
            await db.execute(
                `INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
                [postDbId, tagId]
            );
        }
    }

    console.log(`✓ Posts seeded (${POSTS.length})`);
    return postPublicIdToDbId;
}

async function seedComments(userIds, postPublicIdToDbId) {
    for (const c of COMMENTS) {
        const userId = userIds[c.userIndex];
        const postDbId = postPublicIdToDbId[c.postPublicId];
        const username = USERS[c.userIndex].username;
        await db.execute(
            `INSERT INTO comments (public_id, user_id, post_id, username, comment)
             VALUES (?, ?, ?, ?, ?)`,
            [c.public_id, userId, postDbId, username, c.comment]
        );
    }
    console.log(`✓ Comments seeded (${COMMENTS.length})`);
}

async function seedFavorites(userIds, postPublicIdToDbId) {
    for (const f of FAVORITES) {
        const userId = userIds[f.userIndex];
        const postDbId = postPublicIdToDbId[f.postPublicId];
        await db.execute(
            `INSERT INTO favorites (user_id, post_id) VALUES (?, ?)`,
            [userId, postDbId]
        );
    }
    console.log(`✓ Favorites seeded (${FAVORITES.length})`);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function seedDb() {
    try {
        console.log("⟳ Resetting database...");
        await resetDb();

        console.log("⟳ Initialising tables...");
        await initAllTables();

        console.log("⟳ Seeding data...");
        const userIds         = await seedUsers();
        const taxonomyIds     = await seedTaxonomies();
        const tagIds          = await seedTags();
        const postIdMap       = await seedPosts(userIds, taxonomyIds, tagIds);
        await seedComments(userIds, postIdMap);
        await seedFavorites(userIds, postIdMap);

        console.log("✓ Seed complete");
        return { ok: true, message: "Database seeded successfully." };
    } catch (error) {
        console.error("✗ Seed failed:", error);
        return { ok: false, message: error?.message ?? "Seed failed." };
    }
}