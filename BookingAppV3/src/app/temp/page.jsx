import { rollingWindow } from "../lib/rollingWindow";

export default async function TempRun() {

    await rollingWindow(31);

  return (<>
    <div>I am temp run</div>
  </>);
}