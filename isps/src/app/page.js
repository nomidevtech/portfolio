import AddUser from "./components/add-user";
import FeeSubmit from "./components/fee-submit";
import NavBar from "./components/nav-bar";
import Plans from "./components/plans";
import Sidebar from "./components/side-navigation";
import Stats from "./components/stats";
import UserPlan from "./components/user-plan";

export default function Home() {
  return (<>

    <NavBar />
    <Stats />
    <AddUser />
    <Plans />
    <UserPlan />
    <FeeSubmit />
    <Sidebar />
  </>);
}
