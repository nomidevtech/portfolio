"use server";

import { nanoid } from "nanoid";
import { cloudinaryDelete, cloudinaryDeleteMultiple, cloudinaryUpload } from "../cloudinary";
import { getUser } from "../getUser";
import { db } from "../turso";
import { redirect } from "next/navigation";


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

export async function postUpsert(formData) {

    // console.log([...formData.entries()]);

    let redirectSlug, redirectPublicId;
    // let newImagesPIds, oldImagesPIds;

    try {
        const existingPPID = formData.get('post_public_id') || null;

        const title = formData.get('title')?.trim() || 'no title';
        const slug = title?.replace(/\s+/g, '-').toLowerCase() || 'no-slug';
        const excerpt = formData.get('excerpt')?.trim() || 'no excerpt';
        const taxonomy = formData.get('taxonomy')?.trim().replace(/\s+/g, '-').toUpperCase() || 'no-taxonomy';

        const tagsArr = formData.getAll('tags').filter(Boolean);
        const tags = tagsArr.length > 0 ? tagsArr : ['no-tags'];

        const contentArr = separateContent(formData);
        const contentWithBlobs = contentArr.length > 0 ? contentArr : [{ type: null, name: null, value: null }];
        const contentNormalized = await uploadBlobs(contentWithBlobs);

        const fetchOldPost = await db.execute(`SELECT user_id, content FROM posts WHERE public_id = ? LIMIT 1`, [existingPPID]);

        const currentUser = await getUser();
        if (!currentUser?.id) redirect('/login');

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
        throw error;
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

            const result = await cloudinaryUpload(block.value);

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

    let allSuccess = true;

    for (const tagId of tagIdsArr) {
        const result = await db.execute(`INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`, [post_id, tagId]);
        if (!result.rowsAffected || result.rowsAffected === 0) allSuccess = false;
    }

    return allSuccess;
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