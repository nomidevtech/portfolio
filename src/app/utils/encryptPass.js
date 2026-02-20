import bcrypt from 'bcrypt';


export async function encryptPass(pass) {
    const hashed = await bcrypt.hash(pass, 10);
    return hashed;
}