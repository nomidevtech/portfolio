'use client'
import { useState } from "react";
import ChildFeeSubmit from "./Child";

export default function FeeSubmit() {
    const [resetKey, setResetKey] = useState(0);

    const handleReset = () => {
        setResetKey(prev => prev + 1);
    };

    return (
        <div key={resetKey}>
            <ChildFeeSubmit onReset={handleReset} />
        </div>
    );
}