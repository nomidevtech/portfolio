export function paginate(pageRaw = 1, totalPostsRaw = 1) {

    const pageNum = Number(pageRaw);
    const totalNum = Number(totalPostsRaw);

    const page = Number.isNaN(pageNum) ? 1 : pageNum;
    const totalPosts = Number.isNaN(totalNum) ? 1 : totalNum;

    const perPage = 10;

    const maxPages = Math.ceil(totalPosts / perPage);
    const maxBtns = 5;

    const half = Math.floor(maxBtns / 2);

    let start = page - half;
    let end = page + half;

    if (start < 1) {
        start = 1;
        end = Math.min(maxBtns, maxPages);
    }

    if (end > maxPages) {
        end = maxPages;
        start = Math.max(1, end - maxBtns + 1);
    }

    const btns = Array.from(
        { length: end - start + 1 },
        (_, idx) => start + idx
    );

    return btns;
}