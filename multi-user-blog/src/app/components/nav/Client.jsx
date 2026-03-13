"use client";

import { useState } from "react";
import Link from "next/link";
import Form from "next/form";
import { logout } from "@/app/lib/logout";

const itemStyle = {
    display: "block",
    padding: "8px 16px",
    textDecoration: "none",
    color: "#e2e8f0",
};

export default function NavBarClient({ serializedUser }) {
    const [isOpen, setIsOpen] = useState(false);

    const user = JSON.parse(serializedUser);

    return (
        <nav style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 24px",
            borderBottom: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
        }}>

            <Link href="/" style={{ color: "#e2e8f0", textDecoration: "none" }}>MyApp</Link>

            <div>
                {!user ? (
                    <Link href="/login" style={{ color: "#e2e8f0", textDecoration: "none" }}>Login</Link>
                ) : (
                    <div style={{ position: "relative" }}>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            style={{ cursor: "pointer", background: "none", border: "none", color: "#e2e8f0", fontSize: "14px" }}
                        >
                            {user.name} {isOpen ? "▲" : "▼"}
                        </button>

                        {isOpen && (
                            <div style={{
                                position: "absolute",
                                right: 0,
                                top: "100%",
                                background: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: "6px",
                                padding: "8px 0",
                                minWidth: "200px",
                                zIndex: 10,
                            }}>
                                {/* User info block — name, username, email */}
                                <div style={{ padding: "8px 16px" }}>
                                    <p style={{ margin: 0, fontWeight: "bold", color: "#f1f5f9" }}>{user.name}</p>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>@{user.username}</p>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{user.email}</p>
                                </div>

                                <hr style={{ margin: "8px 0", borderColor: "#334155" }} />

                                <Link href="/settings" style={itemStyle}>Settings</Link>
                                <Link href="/add-post" style={itemStyle}>Add Post</Link>

                                <hr style={{ margin: "8px 0", borderColor: "#334155" }} />

                                <Form action={logout}>
                                    <button
                                        type="submit"
                                        style={{ ...itemStyle, background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "#f87171" }}
                                    >
                                        Logout
                                    </button>
                                </Form>
                            </div>
                        )}

                    </div>
                )}
            </div>

        </nav>
    );
}