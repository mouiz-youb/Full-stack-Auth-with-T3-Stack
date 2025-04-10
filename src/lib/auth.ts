import crypto from 'crypto';
// Gnenerate salt and the hash passwords
export function generateSalt ():string {
    return  crypto.randomBytes(16).toString('hex');
}
export function hashPassword (password:string ,salt:string ):string {
    return crypto
    .pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex')
}
// Verify the password
export function verifyPassword (password:string ,salt :string ,hash:string):boolean {
    const inputHash = hashPassword(password,salt);
    return inputHash === hash;
}
// Generate session token 
export function generateSessionToken ():string {
    return crypto.randomBytes(32).toString('hex');
}
