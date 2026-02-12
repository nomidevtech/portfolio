import bcrypt from 'bcrypt';

export async function decryptPass(plain, hashed) {
    try {
        const isValid = await bcrypt.compare(plain, hashed);

        return { ok: isValid, message: isValid ? 'Password verified' : 'Password did not match' };

    } catch (err) {
        return { ok: false, message: err.message || "password did not match" };
    }

}