import {format} from 'node:util';
import {RawSQL, Select, From, Where} from './clauses';
import {QueryCompiler} from './QueryCompiler';
import {
  ColumnAlias,
  ComparisonOperators,
  LogicalOperators,
  WhereQueryBuilderCallback,
  QueryBuilderCallback
} from '../types';

export class QueryBuilder {
  private selects: (Select | RawSQL)[] = [];
  private tables: (From | RawSQL)[] = [];
  private wheres: (Where | RawSQL | string)[] = [];
  private distinctSelect: boolean = false;

  from(table: string, alias?: string) {
    this.tables.push(new From(table, alias));
    return this;
  }

  select(...columns: (string | ColumnAlias)[]) {
    columns.map(column => {
      if (column instanceof Object) {
        return Object.entries(column).map(([name, alias]) => {
          this.selects.push(new Select(name, alias));
        });
      }

      this.selects.push(new Select(column));
    });

    return this;
  }

  selectRaw(sql: string, ...args: Array<string | number>) {
    this.selects.push(new RawSQL(sql, args));
    return this;
  }

  distinct() {
    this.distinctSelect = true;
    return this;
  }

  private setWhere(
    column: string | Function,
    value: string | number | null | Array<string | number> | Function,
    comparisonOperator: ComparisonOperators | LogicalOperators,
    logicalOperator: LogicalOperators
  ) {
    // Nested where statement wrapped in parentheses
    if (column instanceof Function) {
      const builder = new QueryBuilder();
      column(builder);

      const sql = QueryCompiler.getQueryOperator(logicalOperator) + format(
        '(%s)',
        builder.getWhereSQL(true)
      );

      this.wheres.push(sql);
    }
    // Sub-select within the query
    else if (value instanceof Function) {
      const builder = new QueryBuilder();
      value(builder);

      const sql = QueryCompiler.getQueryOperator(logicalOperator) + format(
        '%s %s (%s)',
        column,
        comparisonOperator,
        builder.getSQL()
      );

      this.wheres.push(sql);
    } else {
      this.wheres.push(
        new Where(column, value, comparisonOperator, this.wheres.length ? logicalOperator : null)
      );
    }

    return this;
  }

  where(
    column: string | WhereQueryBuilderCallback,
    value: string | number | Array<string | number> | QueryBuilderCallback = null,
    comparisonOperator: ComparisonOperators | LogicalOperators = '='
  ) {
    return this.setWhere(column, value, comparisonOperator, 'AND');
  }

  orWhere(
    column: string | WhereQueryBuilderCallback,
    value: string | number | Array<string | number> | QueryBuilderCallback = null,
    comparisonOperator: ComparisonOperators | LogicalOperators = '='
  ) {
    return this.setWhere(column, value, comparisonOperator, 'OR');
  }

  whereBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.where(column, [min, max], 'BETWEEN');
  }

  whereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.where(column, [min, max], 'NOT BETWEEN');
  }

  orWhereBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.orWhere(column, [min, max], 'BETWEEN');
  }

  orWhereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.orWhere(column, [min, max], 'NOT BETWEEN');
  }

  whereIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback = null,
  ) {
    return this.where(column, value, 'IN');
  }

  orWhereIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback = null,
  ) {
    return this.orWhere(column, value, 'IN');
  }

  whereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback = null,
  ) {
    return this.where(column, value, 'NOT IN');
  }

  orWhereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback = null,
  ) {
    return this.orWhere(column, value, 'NOT IN');
  }

  private getSelectSQL() {
    return QueryCompiler.compileSelectStatements(this);
  }

  private getFromSQL() {
    return QueryCompiler.compileFromClauses(this);
  }

  private getWhereSQL(nestedStatement: boolean = false) {
    return QueryCompiler.compileWereClauses(this, nestedStatement);
  }

  isDistinct() {
    return this.distinctSelect
  }

  getSelects() {
    return this.selects;
  }

  getFrom() {
    return this.tables;
  }

  getWheres() {
    return this.wheres;
  }

  getSQL() {
    return [
      this.getSelectSQL(),
      this.getFromSQL(),
      this.getWhereSQL()
    ].join(' ');
  }
}
