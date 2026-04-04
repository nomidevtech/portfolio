import bcrypt from "bcrypt";

export async function hash(raw) {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(raw, saltRounds);
    return hashed;
}

export async function compare(raw, hashed) {
    return await bcrypt.compare(raw, hashed);
}