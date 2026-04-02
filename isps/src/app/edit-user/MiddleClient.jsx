"use client";

import { useState } from "react";
import ClientEditUser from "./ClientEditUser";


export default function MiddleClient({ plans }) {

    const [key, setKey] = useState(0);

    const handleReset = () => {
        setKey(prev => prev + 1);
    };

    return (
        <div key={key}>
            <ClientEditUser onReset={handleReset} plans={plans}  />
        </div>
    )

}