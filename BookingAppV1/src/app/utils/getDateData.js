const daysCode = [
    { day: "Sunday", code: 0 },
    { day: "Monday", code: 1 },
    { day: "Tuesday", code: 2 },
    { day: "Wednesday", code: 3 },
    { day: "Thursday", code: 4 },
    { day: "Friday", code: 5 },
    { day: "Saturday", code: 6 }
];

const monthCode = [
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
]


export function getDayName(dayNumber = 0) {
    const dayName = daysCode.find((day) => day.code === dayNumber).day;
    return dayName;
};

export function getDayNumber(dayName = "Sunday") {
    const dayNumber = daysCode.find((day) => day.day.toLocaleLowerCase() === dayName.toLowerCase()).code;
    return dayNumber;
};

export function getMonthName(monthNumber = 0) {
    const monthName = monthCode.find((month) => month.code === monthNumber).month;
    return monthName;
};

export function getMonthNumber(monthName = "January") {
    const monthNumber = monthCode.find((month) => month.month.toLowerCase() === monthName.toLowerCase()).code;
    return monthNumber;
};
