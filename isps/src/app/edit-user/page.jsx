"use client";

import { useState } from "react";
import ClientEditUser from "./ClientEditUser";


export default function EditUser() {

    const [key, setKey] = useState(0);

    const handleReset = () => {
        setKey(prev => prev + 1);
    };

    return (
        <div key={key}>
            <ClientEditUser onReset={handleReset} />
        </div>
    )

}