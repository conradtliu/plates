const currency : RegExp = new RegExp('^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{1,2})?$');
const cents : RegExp = new RegExp('^.(?:[0-9]{1,2})$');

export const isCurrency = (value : string) => { return currency.test(value) || cents.test(value)}

export function calculateIndividualBill(subtotal: number, tax: number, tip: number, total: number){
    const individualPercent = subtotal/total;
    const billTip = tip * total
    return (subtotal + (tax + billTip) * individualPercent).toFixed(2)
}
