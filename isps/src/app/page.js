import AddUser from "./components/add-user";
import NavBar from "./components/nav-bar";
import Plans from "./components/plans";
import UserPlan from "./components/user-plan";

export default function Home() {
  return (<>
    <NavBar />
    <AddUser />
    <Plans />
    <UserPlan />
  </>);
}
