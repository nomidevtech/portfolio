import acquireDoctorsData from "../lib/acquireDocData";
import ShowDocsByDep from "../components/ShowDocsByDep";


export default async function Appointments() {

    const { doctorsArr, departments } = await acquireDoctorsData();
    const linkSegment = "/appointments/";



    return (
        <ShowDocsByDep
            departmentsSer={JSON.stringify(departments)}
            doctorsArrSer={JSON.stringify(doctorsArr)}
            linkSegment={linkSegment}
        />
    );
}

