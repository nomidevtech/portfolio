export default function slugGenerator(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-')     // replace spaces with -
    .replace(/--+/g, '-');    // remove multiple hyphens
}

