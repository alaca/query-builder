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
  private compiler: QueryCompiler;
  private selects: (Select | RawSQL)[] = [];
  private tables: (From | RawSQL)[] = [];
  private wheres: (Where | RawSQL | string)[] = [];
  private distinctSelect: boolean = false;

  constructor() {
    this.compiler = new QueryCompiler(this);
  }

  from(table: string, alias?: string) {
    this.tables.push(
      new From(table, alias)
    );
    return this;
  }

  select(...columns: (string | ColumnAlias)[]) {
    columns.map(column => {
      if (column instanceof Object) {
        return Object.entries(column).map(([name, alias]) => {
          this.selects.push(
            new Select(name, alias)
          );
        });
      }

      this.selects.push(
        new Select(column)
      );
    });

    return this;
  }

  selectRaw(sql: string, ...args: Array<string | number>) {
    this.selects.push(
      new RawSQL(sql, args)
    );
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

      const sql = this.compiler.getOperator(logicalOperator)
        + `(${builder.getWhereSQL(true)})`;

      this.wheres.push(sql);
    }
    // Sub-select within the query
    else if (value instanceof Function) {
      const builder = new QueryBuilder();
      value(builder);

      const sql = this.compiler.getOperator(logicalOperator)
        + `${column} ${comparisonOperator} ${builder.getSQL()}`;

      this.wheres.push(sql);
    } else {
      this.wheres.push(
        new Where(
          column,
          value,
          comparisonOperator,
          this.wheres.length ? logicalOperator : null
        )
      );
    }

    return this;
  }

  where(
    column: string | WhereQueryBuilderCallback,
    value: string | number | QueryBuilderCallback = null,
    comparisonOperator: ComparisonOperators | LogicalOperators = '='
  ) {
    return this.setWhere(column, value, comparisonOperator, 'AND');
  }

  orWhere(
    column: string | WhereQueryBuilderCallback,
    value: string | number | QueryBuilderCallback = null,
    comparisonOperator: ComparisonOperators | LogicalOperators = '='
  ) {
    return this.setWhere(column, value, comparisonOperator, 'OR');
  }

  whereLike(column: string, value: string) {
    return this.where(column, value, 'LIKE');
  }

  orWhereLike(column: string, value: string) {
    return this.orWhere(column, value, 'LIKE');
  }

  whereNotLike(column: string, value: string) {
    return this.where(column, value, 'NOT LIKE');
  }

  orWhereNotLike(column: string, value: string) {
    return this.orWhere(column, value, 'NOT LIKE');
  }

  whereBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.setWhere(column, [min, max], 'BETWEEN', 'AND');
  }

  whereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.setWhere(column, [min, max], 'NOT BETWEEN', 'AND');
  }

  orWhereBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.setWhere(column, [min, max], 'BETWEEN', 'OR');
  }

  orWhereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.setWhere(column, [min, max], 'NOT BETWEEN', 'OR');
  }

  whereIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback = null
  ) {
    return this.setWhere(column, value, 'IN', 'AND');
  }

  orWhereIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback = null
  ) {
    return this.setWhere(column, value, 'IN', 'OR');
  }

  whereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback = null
  ) {
    return this.setWhere(column, value, 'NOT IN', 'AND');
  }

  orWhereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback = null
  ) {
    return this.setWhere(column, value, 'NOT IN', 'OR');
  }

  whereIsNull(column: string) {
    return this.where(column, null, 'IS NULL');
  }

  orWhereIsNull(column: string) {
    return this.orWhere(column, null, 'IS NULL');
  }

  whereIsNotNull(column: string) {
    return this.where(column, null, 'IS NOT NULL');
  }

  orWhereIsNotNull(column: string) {
    return this.orWhere(column, null, 'IS NOT NULL');
  }

  private getSelectSQL() {
    return this.compiler.compileSelect();
  }

  private getFromSQL() {
    return this.compiler.compileFrom();
  }

  private getWhereSQL(nestedStatement: boolean = false) {
    return this.compiler.compileWere(nestedStatement);
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
