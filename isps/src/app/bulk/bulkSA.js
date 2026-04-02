"use server";

export async function bulkServerAction(formData) {
    try {
        const text = formData.get("bulk-text");

        const filter1 = text.split("\n");
        const filter2 = filter1.map(item => item.split(": ").pop().trim()).filter(Boolean);
        const filter3 = filter2.map(item => item.split("."));

        const arr = [];

        for (const row of filter3) {

            const username = row[0];
            const fees = Number(row[1]);
            let plan = null;

            if (fees <= 400) plan = 1;
            else if (fees >= 500 && fees <= 600) plan = 2;
            else if (fees === 700) plan = 3;
            else if (fees >= 800 && fees <= 1000) plan = 5;
            else if (fees >= 1200 && fees <= 1500) plan = 8;
            else if (fees === 2000) plan = 10;
            else if (fees >= 3500 && fees <= 4000) plan = 20;

            arr.push({ username, fees, plan });

        }




        console.log("I am raw text", text);
        console.log("I am filter1", filter1);
        console.log("I am filter2", filter2);
        console.log("I am filter3", filter3);
        console.log("I am arr", arr);






    } catch (error) {
        console.error(error);
        throw error;
    }
}