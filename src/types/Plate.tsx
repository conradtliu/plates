import { Expense } from '../types';

export type Plate = {
    id: string | number,
    name?: string,
    total: number,
    items: Expense[]
}
