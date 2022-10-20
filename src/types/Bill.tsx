import { Expense, Plate } from '../types';

export type Bill = {
    subtotal: number,
    tax: number,
    tip?: number,
    plates?: Plate[],
    items: Expense[]
}