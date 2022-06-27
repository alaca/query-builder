import {Join, JoinCondition, RawSQL} from './clauses';
import {ComparisonOperators, JoinOperators, JoinQueryBuilderInterface, JoinTypes} from '../types';

export default class JoinQueryBuilder implements JoinQueryBuilderInterface {
  joins: (Join | JoinCondition | RawSQL)[] = [];

  private join(
    type: JoinTypes,
    table: string,
    alias: string | undefined = undefined
  ) {
    this.joins.push(
      new Join(type, table, alias)
    );

    return this;
  }

  private joinCondition(
    operator: JoinOperators,
    column1: string,
    column2: string,
    comparisonOperator: ComparisonOperators = '=',
    quoteValue: boolean
  ) {
    this.joins.push(
      new JoinCondition(
        operator,
        column1,
        column2,
        comparisonOperator,
        quoteValue
      )
    );

    return this;
  }

  on(
    column1: string,
    column2: string | number,
    comparisonOperator: ComparisonOperators = '=',
    quoteValue: boolean = false
  ) {
    this.joins.push(
      new JoinCondition(
        'ON',
        column1,
        column2,
        comparisonOperator,
        quoteValue
      )
    );

    return this;
  }

  and(
    column1: string,
    column2: string | number,
    comparisonOperator: ComparisonOperators = '=',
    quoteValue: boolean = true
  ) {
    this.joins.push(
      new JoinCondition(
        'AND',
        column1,
        column2,
        comparisonOperator,
        quoteValue
      )
    );

    return this;
  }

  or(
    column1: string,
    column2: string | number,
    comparisonOperator: ComparisonOperators = '=',
    quoteValue: boolean = true
  ) {
    this.joins.push(
      new JoinCondition(
        'OR',
        column1,
        column2,
        comparisonOperator,
        quoteValue
      )
    );

    return this;
  }

  leftJoin(table: string, alias: string | undefined = undefined) {
    this.joins.push(
      new Join('LEFT', table, alias)
    );

    return this;
  }

  rightJoin(table: string, alias: string | undefined = undefined) {
    this.joins.push(
      new Join('RIGHT', table, alias)
    );

    return this;
  }

  innerJoin(table: string, alias: string | undefined = undefined) {
    this.joins.push(
      new Join('INNER', table, alias)
    );

    return this;
  }

  joinRaw(sql: string, ...args: Array<string | number>) {
    this.joins.push(
      new RawSQL(sql, args)
    );

    return this;
  }
}
