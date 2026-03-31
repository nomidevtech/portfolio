'use client'

import { useActionState } from "react";
import { fetchStatsServerAction } from "./fetchSA";
import Form from "next/form";

export default function ClientDashboard({ initialData, yearsArr = [], monthsArr = [] }) {

  // 1. 'state' equals 'initialData' (parent data) on initial page load.
  // 2. 'state' updates to the new Server Action return value after submission.
  const [state, action, isPending] = useActionState(fetchStatsServerAction, initialData);

  const { stats, message } = state;

  return (
    <>
      <Form action={action}>
        <select name="month" defaultValue={""} required>
          <option value="" disabled>Select month</option>
          {monthsArr.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select name="year" defaultValue={2026} required>
          <option value="" disabled>Select year</option>
          {yearsArr.map((year) => (
            <option key={year} value={year} >
              {year}
            </option>
          ))}
        </select>

        <button type="submit" disabled={isPending}>
          {isPending ? "Fetching..." : "Fetch"}
        </button>
      </Form>

      {message && <p style={{ color: !state.ok ? "red" : "inherit" }}>{message}</p>}

      {/* This will show the parent's data on load, and the searched data after submit */}
      {stats && (
        <div>
          <p>Total Users: {stats.numberOfUsers}</p>
          <p>Total Revenue: {stats.totalRevenue}</p>
          <p>Recovery: {stats.recovery}</p>
          <p>Pending: {stats.pending}</p>
          <p>Paid: {stats.paid} | Partial: {stats.partial} | Unpaid: {stats.unpaid}</p>
        </div>
      )}
    </>
  );
}