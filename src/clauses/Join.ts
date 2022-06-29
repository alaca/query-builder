import {JoinTypes} from '../../types';

export class Join {
  table: string;
  alias: string | undefined;
  type: JoinTypes

  constructor(
    type: JoinTypes,
    column: string,
    alias: string | undefined
  ) {
    this.type = type;
    this.table = column.trim();
    this.alias = alias?.trim();
  }
}
