import { initBookingsTable, initSlotsTable } from "./Models/initTables";

export default async function Home() {
  await initBookingsTable();
  await initSlotsTable();
  return (<>

  </>
  );
}
