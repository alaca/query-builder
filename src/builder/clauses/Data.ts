import {escapeString} from '../../util/string';

export class Data {
    column: string;
    value: string | number;

    constructor(column: string, value: string | number) {
        this.column = column.trim();
        this.value = escapeString(value);
    }
}
