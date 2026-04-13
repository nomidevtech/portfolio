import Link from "next/link";

export default function Home() {
  return (<>
    <Link href="/client1">Client-1</Link>
    <Link href="/manage-slots">Manage Slots</Link>
  </>);
}
