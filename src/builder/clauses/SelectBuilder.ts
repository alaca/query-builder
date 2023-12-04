export class SelectBuilder {
    column: string;
    callback: Function;

    constructor(column: string, callback: Function) {
        this.column = column.trim();
        this.callback = callback;
    }
}
