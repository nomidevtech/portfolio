export default function getMinutes(hr, min, meridiem) {
    let h = Number(hr);
    const m = Number(min);
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return (h * 60) + m;
}