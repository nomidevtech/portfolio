'use client';

import Link from "next/link";


export default function ShowDocsByDep({ departmentsSer = [], doctorsArrSer = [], linkSegment = "/" }) {
    
    const departments = JSON.parse(departmentsSer);
    const doctorsArr = JSON.parse(doctorsArrSer);

    return (<>
        <div>
            {departments.map((department) => (
                <div key={department}>
                    <h2>{department}</h2>
                    {doctorsArr
                        .filter((doc) => doc.department === department)
                        .map((fn) => (
                            <Link
                                href={`${linkSegment}${fn.public_id}`}
                                key={fn.public_id}
                            >
                                {fn.name}
                            </Link>
                        ))
                    }
                </div>
            ))}
        </div>
    </>);
}