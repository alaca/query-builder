import {ComparisonOperators, LogicalOperators} from '../../types';

export class Where {
  column: string;
  value: string | number | Array<string | number> | undefined;
  comparisonOperator: ComparisonOperators | LogicalOperators;
  logicalOperator: LogicalOperators | null;

  constructor(
    column: string,
    value: string | number | Array<string | number> | undefined,
    comparisonOperator: ComparisonOperators | LogicalOperators,
    logicalOperator: LogicalOperators | null
  ) {
    this.column = column;
    this.value = value;
    this.comparisonOperator = comparisonOperator;
    this.logicalOperator = logicalOperator;
  }
}
