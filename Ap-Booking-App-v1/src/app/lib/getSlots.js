import { db } from "../lib/turso";

export const getSlots = async (dateObj, doctorId) => {

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
        { month: "January", code: 0 }, { month: "February", code: 1 }, { month: "March", code: 2 },
        { month: "April", code: 3 }, { month: "May", code: 4 }, { month: "June", code: 5 },
        { month: "July", code: 6 }, { month: "August", code: 7 }, { month: "September", code: 8 },
        { month: "October", code: 9 }, { month: "November", code: 10 }, { month: "December", code: 11 }
    ];

    const d = dateObj;
    const currentDate = d.getDate();
    const currentMonth = d.getMonth();
    const currentMonthName = monthsCode.find(fn => fn.code === currentMonth).month;
    const nextMonth = d.getMonth() + 1;
    const currentYear = d.getFullYear();
    const currentMonthNumberOfDays = new Date(currentYear, nextMonth, 0).getDate();



    const fetchWeeklyTemplate = await db.execute(`SELECT * FROM weekly_template WHERE month_number = ? AND status = ? AND year = ? AND doctor_id = ?`, [currentMonth, 1, currentYear, doctorId]);
    const weeklyTemplate = fetchWeeklyTemplate.rows;

    if (weeklyTemplate.length === 0) return [];


    const fetchCurrentMonthBooking = await db.execute(`SELECT date, month_name AS month, treatment_start AS start, treatment_end AS end FROM bookings WHERE month_name = ? AND year = ? AND doctor_id = ?`, [currentMonthName, currentYear, doctorId]);

    const currentMonthBookings = fetchCurrentMonthBooking.rows;
    const currentMonthSlots = [];

    for (let i = currentDate; i <= currentMonthNumberOfDays; i++) {
        let freeVirtualSlots = [];

        const dayNumAtPeriod = new Date(currentYear, currentMonth, i).getDay();

        const templateAtPeriod = weeklyTemplate.find(fn => fn.day_number === dayNumAtPeriod);

        const bookingsAtPeriod = [];
        for (const booking of currentMonthBookings) {
            if (booking.date === i) {
                bookingsAtPeriod.push({ start: booking.start, end: booking.end });
            }
        }

        if (!templateAtPeriod) continue; // imp check to skip empty days starting next iteration

        const leftSlot = { start: templateAtPeriod.start_time, end: templateAtPeriod.break_start };
        const rightSlot = { start: templateAtPeriod.break_end, end: templateAtPeriod.end_time };
        const baseSlots = [leftSlot, rightSlot].filter(slot => slot.start != null && slot.end != null);
        freeVirtualSlots = [...baseSlots];

        const sortedBookings = bookingsAtPeriod.sort((a, b) => a.start - b.start);
        

        if (sortedBookings.length > 0) {
            freeVirtualSlots = [];
            for (const baseSlot of baseSlots) {
                let segments = [baseSlot];

                for (const booking of sortedBookings) {
                    let newSegments = [];
                    const buffer = templateAtPeriod.buffer_minutes;
                    const bufferedStart = booking.start - buffer;
                    const bufferedEnd = booking.end + buffer;

                    for (const segment of segments) {
                        // NO OVERLAP
                        if (bufferedEnd <= segment.start || bufferedStart >= segment.end) {
                            newSegments.push(segment);
                            continue;
                        }

                        // LEFT PART
                        if (bufferedStart > segment.start) {
                            newSegments.push({
                                start: segment.start,
                                end: bufferedStart
                            });
                        }

                        // RIGHT PART
                        if (bufferedEnd < segment.end) {
                            newSegments.push({
                                start: bufferedEnd,
                                end: segment.end
                            });
                        }
                    }
                    segments = newSegments;
                }
                freeVirtualSlots.push(...segments);
            }
        }

        currentMonthSlots.push({
            public_id: templateAtPeriod.public_id,
            status: templateAtPeriod.status,
            date: i,
            monthName: currentMonthName,
            month_number: currentMonth,
            year: currentYear,
            day: templateAtPeriod.day,
            day_number: templateAtPeriod.day_number,
            start_time: templateAtPeriod.start_time,
            end_time: templateAtPeriod.end_time,
            break_start: templateAtPeriod.break_start,
            break_end: templateAtPeriod.break_end,
            buffer_minutes: templateAtPeriod.buffer_minutes,
            virtualSlotsBase: baseSlots,
            freeVirtualSlots
        });

    }
    //console.log("currentMonthSlots", currentMonthSlots);
    return currentMonthSlots;



}