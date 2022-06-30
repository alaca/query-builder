import {ComparisonOperators, MathFunctions} from '../../types';

export class Having {
  column: string;
  comparisonOperator: ComparisonOperators;
  value: string | number;
  logicalOperator: 'AND' | 'OR' | null;
  mathFunction: MathFunctions | undefined;

  constructor(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number,
    logicalOperator: 'AND' | 'OR' | null,
    mathFunction?: MathFunctions | undefined
  ) {
    this.column = column;
    this.comparisonOperator = comparisonOperator;
    this.value = value;
    this.logicalOperator = logicalOperator;
    this.mathFunction = mathFunction;
  }
}
