import { db } from "../lib/turso";

export default async function Booking() {

    const fetchWeeklyTemplate = await db.execute(`SELECT * FROM weekly_template;`);
    const weeklyTemplate = fetchWeeklyTemplate.rows;

    const daysCode = [{ day: "Sunday", code: 0 }, { day: "Monday", code: 1 }, { day: "Tuesday", code: 2 }, { day: "Wednesday", code: 3 }, { day: "Thursday", code: 4 }, { day: "Friday", code: 5 }, { day: "Saturday", code: 6 }];

    const d = new Date();
    const currentDate = d.getDate();
    const currentMonth = d.getMonth();
    const nextMonth = d.getMonth() + 1;
    const currentYear = d.getFullYear();
    const currentMonthNumberOfDays = new Date(currentYear, nextMonth, 0).getDate();

    const currentMonthSlots = [];

    for (let i = currentDate; i <= currentMonthNumberOfDays; i++) {

        const dayNumAtPeriod = new Date(currentYear, currentMonth, i).getDay();
        const dayAtPeriod = daysCode.find(fn => fn.code === dayNumAtPeriod).day;

        const templateAtPeriod = weeklyTemplate.find(fn => fn.day_number === dayNumAtPeriod);
        if (templateAtPeriod) {
            currentMonthSlots.push({
                date: i,
                status: "active",
                day: templateAtPeriod?.day,
                day_number: templateAtPeriod?.day_number,
                start_time: templateAtPeriod?.start_time,
                end_time: templateAtPeriod?.end_time,
                break_start: templateAtPeriod?.break_start,
                break_end: templateAtPeriod?.break_end,
                buffer_minutes: templateAtPeriod?.buffer_minutes
            });
        } else {
            currentMonthSlots.push({
                date: i,
                status: "inactive",
                day: dayAtPeriod,
                day_number: dayNumAtPeriod,
                start_time: 0,
                end_time: 0,
                break_start: 0,
                break_end: 0,
                buffer_minutes: 0
            });
        };
    };






    // console.log(weeklyTemplate);
    // console.log(currentDate);
    // console.log(currentMonth);
    // console.log(currentYear);
    // console.log(currentMonthNumberOfDays);
    console.log(currentMonthSlots);


    return (<>
        <div>I am component</div>
    </>);
}