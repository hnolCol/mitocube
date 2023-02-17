
export function fromDateToString(date) {
    return `${date.getFullYear()}-${date.getMonth()+1>9?"":"0"}${date.getMonth()+1}-${date.getDate()+1>9?"":"0"}${date.getDate()}`
}