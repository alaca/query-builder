export class Table {
    name: string;
    alias?: string;

    constructor(table: string, alias?: string) {
        this.name = table.trim();
        this.alias = alias?.trim();
    }
}
