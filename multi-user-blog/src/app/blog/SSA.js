"use server";

import { db } from "../lib/turso";

export async function searchServerAction(_, value) {

    try {

        const searchTerms =
            value
                .replace(/[^a-zA-Z0-9 ]/g, "")
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase()
                .split(' ')
                .filter(Boolean)
                .filter(term => term.length > 2 && term.length < 20)
                .slice(0, 20);

        if (searchTerms.length === 0) return { ok: false, postTitlesArr: [], message: "invalid search terms." };


        const clause = searchTerms.map(() => `title LIKE ?`).join(' OR ');
        const values = searchTerms.map(term => `%${term}%`);

        const query = `SELECT public_id, title, slug FROM posts WHERE ${clause} LIMIT 10`;


        const result = await db.execute(query, values);

        if (result.rows.length === 0) return { ok: false, postTitlesArr: [], message: "no results." };

        const postTitlesArr = result?.rows?.map((row) => {
            return { ppid: row.public_id, title: row.title, slug: row.slug }
        });


        return { ok: true, postTitlesArr, message: "success" };




    } catch (error) {
        console.error(error);
        return { ok: false, postTitlesArr: [], message: "something went wrong" };
    }
}