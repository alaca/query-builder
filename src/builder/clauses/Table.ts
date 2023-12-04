export class Table {
    table: string;
    alias?: string;

    constructor(table: string, alias?: string) {
        this.table = table.trim();
        this.alias = alias?.trim();
    }
}
