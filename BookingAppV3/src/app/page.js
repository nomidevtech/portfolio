import { initBookingsTable } from "./Models/initTables";

export default async function Home() {
    await initBookingsTable();
  return (<>
  
  </>
  );
}
