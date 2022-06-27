export class Select {
  column: string;
  alias: string | null;

  constructor(column: string, alias?: string | null) {
    this.column = column.trim();
    this.alias = alias?.trim();
  }
}
