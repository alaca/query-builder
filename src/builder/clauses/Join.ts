import {JoinTypes} from '../types';

export class Join {
    table: string;
    type: JoinTypes;
    alias?: string;

    constructor(
        type: JoinTypes,
        column: string,
        alias?: string,
    ) {
        this.type = type;
        this.table = column.trim();
        this.alias = alias?.trim();
    }
}
