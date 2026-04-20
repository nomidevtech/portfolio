import { db } from "@/app/lib/turso";

// ─────────────────────────────────────────────
// ORDER MATTERS.
// Tables that are referenced by foreign keys must
// be created BEFORE the tables that reference them.
//
// Safe creation order:
//   1. users
//   2. sessions      (FK → users)
//   3. posts         (FK → users)
//   4. taxonomies
//   5. tags
//   6. post_taxonomies  (FK → posts, taxonomies)
//   7. post_tags        (FK → posts, tags)
//   8. favorites        (FK → users, posts)
//   9. comments         (FK → users, posts)
// ─────────────────────────────────────────────

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
            FOREIGN KEY (user_id)  REFERENCES users(id)    ON DELETE CASCADE,
            FOREIGN KEY (post_id)  REFERENCES posts(id)    ON DELETE CASCADE,
            FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE
        )
    `);
}
