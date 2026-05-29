import bcrypt from "bcrypt";

export async function hash(raw, rounds = 10) {
    const hashed = await bcrypt.hash(raw, rounds);
    return hashed;
}

export async function compare(raw, hashed) {
    return await bcrypt.compare(raw, hashed);
}