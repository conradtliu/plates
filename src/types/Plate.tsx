import { Expense } from './Expense';

export type Plate = {
    id: string | number,
    total: number,
    items?: Expense[]
}
