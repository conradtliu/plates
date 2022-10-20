import { Expense } from '../types';

export type Plate = {
    id: string | number,
    total: number,
    items: Expense[]
}
