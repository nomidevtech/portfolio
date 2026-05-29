import { db } from "@/app/lib/turso";


export async function initUsersTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id             INTEGER  PRIMARY KEY AUTOINCREMENT,
            public_id      TEXT     NOT NULL UNIQUE,
            name           TEXT     NOT NULL,
            username       TEXT     NOT NULL UNIQUE,
            email          TEXT     NOT NULL UNIQUE,
            email_verified INTEGER  NOT NULL DEFAULT 0,
            email_token    TEXT,
            password       TEXT     NOT NULL,
            role           TEXT     NOT NULL DEFAULT 'user',
            CreatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export async function initSessionsTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
            id         INTEGER  PRIMARY KEY AUTOINCREMENT,
            session_id TEXT     NOT NULL UNIQUE,
            user_id    INTEGER  NOT NULL,
            expires_at TEXT     NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
}

export async function initPostsTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS posts (
            id         INTEGER  PRIMARY KEY AUTOINCREMENT,
            public_id  TEXT     NOT NULL UNIQUE,
            user_id    INTEGER  NOT NULL,
            title      TEXT     NOT NULL,
            slug       TEXT     NOT NULL,
            excerpt    TEXT,
            content    TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
}

export async function initTaxonomiesTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS taxonomies (
            id         INTEGER  PRIMARY KEY AUTOINCREMENT,
            public_id  TEXT,
            name       TEXT     NOT NULL UNIQUE,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export async function initTagsTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS tags (
            id         INTEGER  PRIMARY KEY AUTOINCREMENT,
            public_id  TEXT,
            name       TEXT     NOT NULL UNIQUE,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export async function initPostTaxonomiesTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS post_taxonomies (
            post_id     INTEGER NOT NULL,
            taxonomy_id INTEGER NOT NULL,
            PRIMARY KEY (post_id, taxonomy_id),
            FOREIGN KEY (post_id)     REFERENCES posts(id)      ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (taxonomy_id) REFERENCES taxonomies(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);
}

export async function initPostTagsTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS post_tags (
            post_id INTEGER NOT NULL,
            tag_id  INTEGER NOT NULL,
            PRIMARY KEY (post_id, tag_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);
}

export async function initFavoritesTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS favorites (
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, post_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);
}

export async function initCommentsTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS comments (
            id         INTEGER  PRIMARY KEY AUTOINCREMENT,
            public_id  TEXT     NOT NULL UNIQUE,
            user_id    INTEGER  NOT NULL,
            post_id    INTEGER  NOT NULL,
            username   TEXT     NOT NULL,
            comment    TEXT     NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id)  REFERENCES users(id)       ON DELETE CASCADE,
            FOREIGN KEY (post_id)  REFERENCES posts(id)       ON DELETE CASCADE,
            FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE
        )
    `);
}

export async function resetDb() {
    const tables = [
        "comments",
        "favorites",
        "post_tags",
        "post_taxonomies",
        "posts",
        "tags",
        "taxonomies",
        "sessions",
        "users",
    ];
    for (const table of tables) {
        await db.execute(`DROP TABLE IF EXISTS ${table}`);
    }
    global.__dbInitialized = false;
}

export async function initAllTables() {
    if (global.__dbInitialized) return;
    await initUsersTable();
    await initSessionsTable();
    await initPostsTable();
    await initTaxonomiesTable();
    await initTagsTable();
    await initPostTaxonomiesTable();
    await initPostTagsTable();
    await initFavoritesTable();
    await initCommentsTable();
    global.__dbInitialized = true;
}