import {format} from 'node:util';
import {escapeString} from "../../util/string";

export class RawSQL {
    sql: string;

    constructor(sql: string, args: Array<string | number>) {
        this.sql = args.length
            ? format(sql, ...args.map(v => escapeString(v)))
            : sql;
    }
}
