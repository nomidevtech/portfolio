'use client'

import { useActionState, useEffect } from "react";
import { fetchStatsServerAction } from "./fetchSA";
import Form from "next/form";

export default function ClientDashboard2({ payload = {}, yearsArr = [], monthsArr = [] }) {

  const statsFormat = {
    numberOfUsers: 0,
    totalRevenue: 0,
    recovery: 0,
    pending: 0,
    unpaid: 0,
    partial: 0,
    paid: 0,
  };

  const initialState = { ok: null, searchComplete: false, stats: { ...statsFormat }, message: "" };
  const [state, action, isPending] = useActionState(fetchStatsServerAction, initialState);

  const defaultStats = payload;
  let customStats = null;
  let isCustom = false;
  let stats = isCustom ? customStats : defaultStats;

  useEffect(() => {
    if (state.ok && state.stats) customStats = state.stats; isCustom = true;
  }, [state]);










  return (
    <>
      <Form action={action}>
        <select name="month" defaultValue={""}>
          <option value="" disabled>Select month</option>
          {monthsArr.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <select name="year" defaultValue={""}>
          <option value="" disabled>Select year</option>
          {yearsArr.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isPending}>
          {isPending ? "Fetching..." : "Fetch"}
        </button>
      </Form>
      {!state.ok && <p>{state.message}</p>}

    </>
  );
}