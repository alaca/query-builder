export class From {
    table: string;
    alias: string;

    constructor(table: string, alias?: string | null) {
        this.table = table.trim();
        this.alias = alias?.trim();
    }
}
