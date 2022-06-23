export class RawSQL {
  sql: string;

  constructor(sql: string, args?: Array<string | number>) {
    this.sql = args?.length ? 'sss' : sql;
  }
}
