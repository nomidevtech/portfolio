

export function minutesToMeridiem(totalMinutes = 0, fullString = false) {

    const hrs24 = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const meridiem = hrs24 >= 12 ? "PM" : "AM";

    let hrs12 = hrs24 % 12;
    if (hrs12 === 0) hrs12 = 12;

    const hrsStr = hrs12 < 10 ? "0" + hrs12 : String(hrs12);
    const minsStr = mins < 10 ? "0" + mins : String(mins);

    const time = {
        full: `${hrsStr}:${minsStr} ${meridiem}`,
        hrs: hrsStr,
        mins: minsStr,
        meridiem: meridiem
    };

    return fullString ? time.full : time;


    

}