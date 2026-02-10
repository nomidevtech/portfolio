
import { db } from "@/app/Lib/turso"

export default async function PostAuthor({ auther }) {



    


    return (
        <h1>{auther ?? 'Unkown Auther'}</h1>

    )
}