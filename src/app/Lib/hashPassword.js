import bcrypt from 'bcrypt';


export async function hashPassword(pass) {
    const hashed = await bcrypt.hash(pass, 10);
    return hashed;
}