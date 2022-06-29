import {ComparisonOperators, JoinOperators} from '../../../types';

export class JoinCondition {
  logicalOperator: string;
  column1: string;
  column2: string | number;
  comparisonOperator: ComparisonOperators
  quote: boolean;

  constructor(
    logicalOperator: JoinOperators,
    column1: string,
    column2: string | number,
    comparisonOperator: ComparisonOperators = '=',
    quote: boolean = false
  ) {
    this.logicalOperator = logicalOperator;
    this.column1 = column1.trim();
    this.column2 = column2;
    this.comparisonOperator = comparisonOperator;
    this.quote = quote;
  }
}
