"use server";

import { nanoid } from "nanoid";
import { cloudinaryDeleteMultiple, cloudinaryUpload } from "../cloudinary";
import { getUser } from "../getUser";
import { db } from "../turso";
import { redirect } from "next/navigation";
import sharp from "sharp";


// try {
//     await initPostTable();
//     await initTaxonomyTable();
//     await initTagsTable();
//     await initPost_taxonomies();
//     await initPost_tags();
// } catch (error) {
//     console.error(error);
//     throw error;
// }

export async function postUpsert(_, formData) {

    const currentUser = await getUser();
    if (!currentUser?.id) redirect('/login');

    if (currentUser?.email_verified !== 1) return { ok: false, message: "Please verify your email first." };

    // console.log([...formData.entries()]);

    let redirectSlug, redirectPublicId;
    // let newImagesPIds, oldImagesPIds;

    try {
        const existingPPID = formData.get('post_public_id') || null;

        const title = formData.get('title')?.trim() || 'no title';
        if (!title) return { ok: false, message: "Title is required." };
        const slug = title?.replace(/\s+/g, '-').toLowerCase() || 'titleless';
        const excerpt = formData.get('excerpt')?.trim() || 'no description';
        const taxonomy = formData.get('taxonomy')?.trim().replace(/\s+/g, '-').toUpperCase() || 'uncategorized';

        const tagsArr = formData.getAll('tags').filter(Boolean);
        const tags = tagsArr.length > 0 ? tagsArr : ['uncategorized'];

        const contentArr = separateContent(formData);
        const contentWithBlobs = contentArr.length > 0 ? contentArr : [{ type: null, name: null, value: null }];
        const contentNormalized = await uploadBlobs(contentWithBlobs);

        const fetchOldPost = await db.execute(`SELECT user_id, content FROM posts WHERE public_id = ? LIMIT 1`, [existingPPID]);



        const autherizedToUpdate = fetchOldPost?.rows?.length > 0 && fetchOldPost.rows[0].user_id === currentUser?.id;




        if (existingPPID && fetchOldPost.rows.length > 0 && autherizedToUpdate) {
            const oldImagesPIds = getImagesPIds(JSON.parse(fetchOldPost.rows[0].content));
            const newImagesPIds = getImagesPIds(contentNormalized);

            await deleteImages(oldImagesPIds, newImagesPIds);
        }



        const { postId, publicId } = await upsertPost(existingPPID, contentNormalized, title, slug, excerpt, currentUser.id, autherizedToUpdate);
        if (!postId) throw new Error('no post upserted');

        const taxonomyId = await upsertTaxonomy(taxonomy);
        if (!taxonomyId) throw new Error('no taxonomy upserted');

        const postTaxonomyResult = await upsertPost_taxonomies(postId, taxonomyId);
        if (!postTaxonomyResult) throw new Error('no post_taxonomies upserted');

        const tagIds = await upsertTags(tags);
        if (tagIds.length === 0) throw new Error('no tags upserted');

        const postTagResult = await postTagResults(postId, tagIds);
        if (!postTagResult) throw new Error('no post_tags upserted');

        redirectSlug = slug;
        redirectPublicId = publicId;


    } catch (error) {
        console.error(error);
        return { ok: false, message: error.message ? error.message : 'Something went wrong' };
    };
    redirect(`/post/${redirectSlug}/${redirectPublicId}`);
}

const separateContent = (formData) => {

    const content = [];

    for (const [key, value] of formData.entries()) {
        if (key === 'title' || key === 'excerpt' || key === 'taxonomy' || key === 'tags') continue;

        if (key.startsWith('heading')) content.push({
            type: 'heading', name: key, value
        });
        if (key.startsWith('paragraph')) content.push({
            type: 'paragraph', name: key, value
        });
        if (key.startsWith('image')) content.push({
            type: 'image', name: key, value
        });
    }

    const MAX_BLOCKS = 20;
    if (content.length > MAX_BLOCKS) throw new Error(`You can't have more than ${MAX_BLOCKS} blocks`);

    return content;
};

const uploadBlobs = async (contentBlocks) => {

    const copy = contentBlocks.map(block => ({ ...block }));

    for (const block of copy) {
        if (
            block.type === "image" &&
            block.value instanceof File &&
            block.value.size > 0
        ) {

            let arrayBuffer;

            const MAX_SIZE = 10 * 1024 * 1024; // 10MB
            if (block.value.size > MAX_SIZE) throw new Error("Image must be under 10MB");


            try {
                arrayBuffer = await block.value.arrayBuffer();
            } catch {
                throw new Error("Failed to read image file");
            }

            const buffer = Buffer.from(arrayBuffer);

            const sharpResult = await sharpValidation(buffer);
            if (!sharpResult.ok) throw new Error(sharpResult.message);

            const result = await cloudinaryUpload(sharpResult?.file);
            if (!result.ok) throw new Error(result.message);

            if (result?.url && result?.publicId) {
                block.value = {
                    url: result.url,
                    publicId: result.publicId
                };
            }
        }
        else if (block.type === 'image' && typeof block.value === 'string') {
            const pasred = JSON.parse(block.value);
            block.value = pasred;
        }
    }
    return copy;
};

async function initPostTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY,
            public_id TEXT,
            user_id INTEGER,
            title TEXT,
            slug TEXT,
            excerpt TEXT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
}

async function initTaxonomyTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS taxonomies (
            id INTEGER PRIMARY KEY,
            public_id TEXT,
            name TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function initPost_taxonomies() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS post_taxonomies (
            post_id INTEGER NOT NULL,
            taxonomy_id INTEGER NOT NULL,
            PRIMARY KEY (post_id, taxonomy_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (taxonomy_id) REFERENCES taxonomies(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);
}

async function initTagsTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY,
            public_id TEXT,
            name TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function initPost_tags() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS post_tags (
            post_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (post_id, tag_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);
}

const upsertPost = async (public_id, content, title, slug, excerpt, user_id, isAutherized) => {
    if (!public_id) {
        const newPublicId = nanoid(12);
        const result = await db.execute(`
            INSERT INTO posts (public_id, user_id, title, slug, excerpt, content)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id
        `, [newPublicId, user_id, title, slug, excerpt, JSON.stringify(content)]);
        return { postId: result.rows[0]?.id, publicId: newPublicId };
    } else {
        if (!isAutherized) throw new Error('unauthorized');

        const result = await db.execute(`
            UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ? WHERE public_id = ?
            RETURNING id
        `, [title, slug, excerpt, JSON.stringify(content), public_id]);

        const id = result.rows[0]?.id;
        if (id) {
            await db.execute(`DELETE FROM post_taxonomies WHERE post_id = ?`, [id]);
            await db.execute(`DELETE FROM post_tags WHERE post_id = ?`, [id]);
        }
        return { postId: id, publicId: public_id };
    }
};

const upsertTaxonomy = async (taxonomy) => {
    if (!taxonomy) return null;
    const result = await db.execute(`SELECT id FROM taxonomies WHERE name = ? LIMIT 1`, [taxonomy]);
    if (result.rows.length > 0) return result.rows[0].id;

    const result2 = await db.execute(`INSERT INTO taxonomies (name) VALUES (?) RETURNING id`, [taxonomy]);
    return result2.rows[0].id;
};

const upsertPost_taxonomies = async (post_id, taxonomy_id) => {
    if (!post_id || !taxonomy_id) return false;
    const result = await db.execute(`INSERT INTO post_taxonomies (post_id, taxonomy_id) VALUES (?, ?)`, [post_id, taxonomy_id]);
    return result.rowsAffected === 1;
};

const upsertTags = async (tagsArr) => {

    const clean = [...new Set(tagsArr.filter(Boolean).map(tag => tag.trim().replace(/\s+/g, '-').toLowerCase()))];
    if (clean.length === 0) return [];

    const placeholders = clean.map(() => '(?)').join(', ');

    await db.execute(`INSERT OR IGNORE INTO tags (name) VALUES ${placeholders}`, clean);
    const result = await db.execute(`SELECT id FROM tags WHERE name IN (${placeholders})`, clean);

    return result.rows.map(r => r.id);

};

const postTagResults = async (post_id, tagIdsArr) => {
    if (!post_id || tagIdsArr.length === 0) return false;
    const placeholders = tagIdsArr.map(() => '(?, ?)').join(', ');
    const values = tagIdsArr.flatMap(tagId => [post_id, tagId]);
    const result = await db.execute(
        `INSERT INTO post_tags (post_id, tag_id) VALUES ${placeholders}`,
        values
    );
    return result.rowsAffected > 0;
};


async function deleteImages(oldImagesPIds, newImagesPIds) {
    const idsToDelete = oldImagesPIds.filter(oldId => !newImagesPIds.includes(oldId));
    if (idsToDelete.length === 0) return;
    try {
        await cloudinaryDeleteMultiple(idsToDelete);
    } catch (err) {
        console.error('Failed to delete orphan images:', idsToDelete, err);

    }
};



function getImagesPIds(content) {
    const pIds = [];
    for (const { type, value } of content) {
        if (type === 'image' && value?.publicId) pIds.push(value.publicId);
    }
    return pIds;
};


async function sharpValidation(buffer) {
    try {
        const image = sharp(buffer, { failOnError: true });
        const metadata = await image.metadata();

        const allowedFormats = new Set(["jpeg", "png", "webp"]);
        if (!allowedFormats.has(metadata.format)) {
            return { ok: false, file: null, message: "Unsupported format" };
        }

        if (!metadata.width || !metadata.height) {
            return { ok: false, file: null, message: "Invalid dimensions" };
        }

        if (metadata.width < 300 || metadata.height < 300) {
            return { ok: false, file: null, message: "Image too small" };
        }

        if (metadata.width > 5000 || metadata.height > 5000) {
            return { ok: false, file: null, message: "Image too large" };
        }

        const processedBuffer = await sharp(buffer)
            .rotate()
            .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        return { ok: true, file: processedBuffer, message: null };

    } catch {
        return { ok: false, file: null, message: "Invalid image file" };
    }
}