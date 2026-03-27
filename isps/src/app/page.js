import AddUser from "./components/add-user";
import NavBar from "./components/nav-bar";
import Plans from "./components/plans";

export default function Home() {
  return (<>
    <NavBar />
    <AddUser />
    <Plans />
  </>);
}
