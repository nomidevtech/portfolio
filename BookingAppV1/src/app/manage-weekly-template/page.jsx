import acquireDoctorsData from "../lib/acquireDocData";
import ShowDocsByDep from "../components/ShowDocsByDep";


export default async function ManageWeeklyTemplates() {

    const { doctorsArr, departments } = await acquireDoctorsData();
    const linkSegment = "/manage-weekly-template/";



    return (
        <ShowDocsByDep
            departmentsSer={JSON.stringify(departments)}
            doctorsArrSer={JSON.stringify(doctorsArr)}
            linkSegment={linkSegment}
        />
    );
}

