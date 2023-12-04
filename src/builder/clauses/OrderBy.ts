import {SortDirection} from '../types';

export class OrderBy {
    column: string;
    direction: string;

    constructor(column: string, direction: SortDirection) {
        this.column = column.trim();
        this.direction = direction.trim();
    }
}
