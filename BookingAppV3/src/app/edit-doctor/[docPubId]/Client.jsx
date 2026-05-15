"use client";

import { useActionState } from "react";
import { addDoctorTreatment, deleteDoctor, editDoctorServerAction, removeDoctorTreatment } from "./sa";

export default function ClientEditDoctor({
    docPubId,
    doctorData,
    departments,
    assignedTreatments,
    availableTreatments,
    qualifications
}) {
    const [editState, editAction] = useActionState(editDoctorServerAction, null);
    const [addState, addTreatmentAction] = useActionState(addDoctorTreatment, null);
    const [removeState, removeTreatmentAction] = useActionState(removeDoctorTreatment, null);
    const [deleteState, deleteAction] = useActionState(deleteDoctor, null);

    return (
        <>
            <div>Editing: {doctorData?.doctor_name}</div>
            {editState?.message && <p>{editState.message}</p>}

            <label>Add Additional Treatments</label>
            <form action={addTreatmentAction}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <select name="treatment">
                    <option>Select Additional Treatments</option>
                    {availableTreatments?.map((fn, idx) => <option key={idx} value={fn.public_id}>{fn.string}</option>)}
                </select>
                <button type="submit">Add</button>
            </form>

            <label>Remove Treatments</label>
            <form action={removeTreatmentAction}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <select name="remove_treatment">
                    <option>Select Treatments to Remove</option>
                    {assignedTreatments?.map((fn, idx) => <option key={idx} value={fn.public_id}>{fn.string}</option>)}
                </select>
                <button type="submit">Remove</button>
            </form>

            <form action={editAction}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <input type="text" name="name" placeholder="Name" defaultValue={doctorData.doctor_name[0].toUpperCase() + doctorData.doctor_name.slice(1)} />
                <input type="text" name="username" placeholder="username" defaultValue={doctorData.doctor_username} />
                <input type="text" name="new_password" placeholder="New Password" />
                <input list="departments" name="department" placeholder="Department" defaultValue={doctorData.department[0].toUpperCase() + doctorData.department.slice(1)} />
                <datalist id="departments">
                    {departments?.map((dep, idx) => <option key={idx} value={dep} />)}
                </datalist>
                <input type="text" name="qualification" placeholder="Qualifications" defaultValue={qualifications.join(", ")} />
                <button type="submit">Submit</button>
            </form>

            <div>
                <p>Name: {doctorData.doctor_name[0].toUpperCase() + doctorData.doctor_name.slice(1)}</p>
                <p>Department: {doctorData.department[0].toUpperCase() + doctorData.department.slice(1)}</p>
                <p>Qualifications: {qualifications.join(", ").toUpperCase() || "None"}</p>
                <p>Treatments: {assignedTreatments?.length > 0 ? assignedTreatments.map(t => t.string).join(", ") : "None"}</p>
            </div>

            <form action={deleteAction}>
                <input type="hidden" name="doctor_pubId" value={docPubId} />
                <button type="submit">Delete Doctor</button>
            </form>
        </>
    );
}