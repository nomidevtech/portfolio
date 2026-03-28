'use client';

import { startTransition, useActionState, useRef, useState } from "react";
import { searchPlanAction, searchUserAction, submitAction } from "./userPlanSA";
import Form from "next/form";


export default function UserPlan() {

    const initialState = { ok: null, searchComplete: false, arr: [], message: "" };

    const [state, formAction, isPending] = useActionState(submitAction, initialState);

    const [stateUsername, actionUsername, isPendingUsername] = useActionState(searchUserAction, initialState);
    const [statePlan, actionPlan, isPendingPlan] = useActionState(searchPlanAction, initialState);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const usernameRef = useRef(null);
    const planRef = useRef(null);




    const handlePlanOnChange = (e) => {
        const value = e.target.value;
        if (planRef.current) clearTimeout(planRef.current);

        planRef.current = setTimeout(() => {
            startTransition(() => {
                actionPlan(value);
            });
        }, 500);
    };




    const hanldeUserOnChange = (e) => {
        const value = e.target.value;
        if (usernameRef.current) clearTimeout(usernameRef.current);

        usernameRef.current = setTimeout(() => {
            startTransition(() => {
                actionUsername(value);
            });
        }, 500);
    };


    return (<>

        <input
            type="text"
            name="term"
            placeholder="search user"
            onChange={hanldeUserOnChange}
        />
        {isPendingUsername && "Loading..."}

        {stateUsername.ok && stateUsername.searchComplete && stateUsername.arr.length > 0 &&
            <>
                {stateUsername.arr.map((user) => (
                    <div key={user.public_id} >
                        <button
                            className="cursor-pointer"
                            onClick={() => setSelectedUser({
                                public_id: user.public_id,
                                username: user.username
                            })}
                        >
                            {user.username}
                        </button>
                    </div>
                ))}
            </>
        }

        {stateUsername.ok && stateUsername.searchComplete && stateUsername.arr.length === 0 && <p>No user found</p>}

        <input
            type="number"
            name="plan"
            placeholder="search plan"
            onChange={handlePlanOnChange}
        />
        {isPendingPlan && "Loading..."}

        {statePlan.ok && statePlan.searchComplete && statePlan.arr.length > 0 &&
            <>
                {statePlan.arr.map((plan) => (
                    <div key={plan.public_id} >
                        <button
                            className="cursor-pointer"
                            onClick={() => setSelectedPlan({
                                public_id: plan.public_id,
                                speed: plan.speed
                            })}
                        >
                            {plan.speed}
                        </button>
                    </div>
                ))}
            </>
        }

        {statePlan.ok && statePlan.searchComplete && statePlan.arr.length === 0 && <p>No plan found</p>}

        {selectedUser && <>
            <p>Selected user: {selectedUser.username}
            </p>
            <button onClick={() => setSelectedUser(null)}>Clear User</button>
        </>}

        {selectedPlan && <>
            <p>Selected plan: {selectedPlan.speed}</p>
            <button onClick={() => setSelectedPlan(null)}>Clear Plan</button>
        </>}


        {selectedUser && selectedPlan &&
            <Form action={formAction}>
                <input type="hidden" name="userId" value={selectedUser.public_id} />
                <input type="hidden" name="planId" value={selectedPlan.public_id} />
                <button type="submit" disabled={isPending}>{isPending ? "Assigning..." : "Assign"}</button>
            </Form>
        }
        {state.message && <p>{state.message}</p>}


    </>);
}