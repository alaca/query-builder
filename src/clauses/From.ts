export class From {
  table: string;
  alias: string | undefined;

  constructor(table: string, alias?: string | undefined) {
    this.table = table.trim();
    this.alias = alias?.trim();
  }
}
