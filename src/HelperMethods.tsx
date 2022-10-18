const currency : RegExp = new RegExp('^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{1,2})?$');

export const isCurrency = (value : string) => { return currency.test(value) }