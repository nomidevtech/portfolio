import { db } from "../lib/turso";
import ClientBooking from "./ClientBooking";

export default async function Booking() {

    const fetchWeeklyTemplate = await db.execute(`SELECT * FROM weekly_template;`);
    const weeklyTemplate = fetchWeeklyTemplate.rows;

    const daysCode = [
        { day: "Sunday", code: 0 },
        { day: "Monday", code: 1 },
        { day: "Tuesday", code: 2 },
        { day: "Wednesday", code: 3 },
        { day: "Thursday", code: 4 },
        { day: "Friday", code: 5 },
        { day: "Saturday", code: 6 }
    ];

    const monthsCode = [
        { month: "January", code: 0 },
        { month: "February", code: 1 },
        { month: "March", code: 2 },
        { month: "April", code: 3 },
        { month: "May", code: 4 },
        { month: "June", code: 5 },
        { month: "July", code: 6 },
        { month: "August", code: 7 },
        { month: "September", code: 8 },
        { month: "October", code: 9 },
        { month: "November", code: 10 },
        { month: "December", code: 11 }
    ];


    const d = new Date();
    const currentDate = d.getDate();
    const currentMonth = d.getMonth();
    const nextMonth = d.getMonth() + 1;
    const currentYear = d.getFullYear();
    const currentMonthNumberOfDays = new Date(currentYear, nextMonth, 0).getDate();
    const currentMonthName = monthsCode.find(fn => fn.code === currentMonth).month;

    const currentMonthSlots = [];

    for (let i = currentDate; i <= currentMonthNumberOfDays; i++) {

        const dayNumAtPeriod = new Date(currentYear, currentMonth, i).getDay();
        const dayAtPeriod = daysCode.find(fn => fn.code === dayNumAtPeriod).day;

        const templateAtPeriod = weeklyTemplate.find(fn => fn.day_number === dayNumAtPeriod);
        if (templateAtPeriod) {
            currentMonthSlots.push({
                status: "active",
                date: i,
                monthName: currentMonthName,
                day: templateAtPeriod?.day,
                day_number: templateAtPeriod?.day_number,
                start_time: templateAtPeriod?.start_time,
                end_time: templateAtPeriod?.end_time,
                break_start: templateAtPeriod?.break_start,
                break_end: templateAtPeriod?.break_end,
                buffer_minutes: templateAtPeriod?.buffer_minutes,
                virtualSlotsBase: [{ start: templateAtPeriod?.start_time, end: templateAtPeriod?.break_start }, { start: templateAtPeriod?.break_end, end: templateAtPeriod?.end_time }]
            });
        } else {
            currentMonthSlots.push({
                status: "inactive",
                date: i,
                monthName: currentMonthName,
                day: dayAtPeriod,
                day_number: dayNumAtPeriod,
                start_time: null,
                end_time: null,
                break_start: null,
                break_end: null,
                buffer_minutes: null,
                virtualSlotsBase: []
            });
        };
    };






    // console.log(weeklyTemplate);
    // console.log(currentDate);
    // console.log(currentMonth);
    // console.log(currentYear);
    // console.log(currentMonthNumberOfDays);
    //console.dir(currentMonthSlots, { depth: null });


    return (<>
        <ClientBooking currentMonthSlots={currentMonthSlots} monthName={currentMonthName} />
    </>);
}