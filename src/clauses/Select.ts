export class Select {
  column: string;
  alias: string | undefined;

  constructor(column: string, alias?: string | undefined) {
    this.column = column.trim();
    this.alias = alias?.trim();
  }
}
