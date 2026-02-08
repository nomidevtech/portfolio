import { db } from "../Lib/turso"
export default async function  PostAuthor ({id}){

    
    
    const username = (await db.execute(`SELECT username FROM users WHERE id = ? `, [id])).rows[0].username
    

    return (
        <h1>{ username ?? 'Unkown Auther'}</h1>
        
    )
}