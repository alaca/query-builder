import {From, RawSQL, Select, Where} from './clauses';
import {QueryCompiler} from './QueryCompiler';
import JoinQueryBuilder from './JoinQueryBuilder';
import {
  ColumnAlias,
  ComparisonOperators,
  LogicalOperators,
  QueryBuilderCallback,
  WhereQueryBuilderCallback,
  JoinQueryBuilderCallback,
  QueryBuilder as QueryBuilderInterface
} from '../types';

export default class QueryBuilder implements QueryBuilderInterface {
  #compiler: QueryCompiler;
  #joinBuilder: JoinQueryBuilder;
  #selects: (Select | RawSQL)[] = [];
  #tables: (From | RawSQL)[] = [];
  #wheres: (Where | RawSQL | string)[] = [];
  #joins: (RawSQL | JoinQueryBuilderCallback)[] = [];
  #groupByColumns: (RawSQL | string)[] = [];
  #distinctSelect: boolean = false;

  constructor() {
    this.#compiler = new QueryCompiler(this);
    this.#joinBuilder = new JoinQueryBuilder();
  }

  from(table: string, alias?: string) {
    this.#tables.push(
      new From(table, alias)
    );
    return this;
  }

  select(...columns: (string | ColumnAlias)[]) {
    columns.map(column => {
      if (column instanceof Object) {
        return Object.entries(column).map(([name, alias]) => {
          this.#selects.push(
            new Select(name, alias)
          );
        });
      }

      this.#selects.push(
        new Select(column)
      );
    });

    return this;
  }

  selectRaw(sql: string, ...args: Array<string | number>) {
    this.#selects.push(
      new RawSQL(sql, args)
    );
    return this;
  }

  distinct() {
    this.#distinctSelect = true;
    return this;
  }

  private setWhere(
    column: string | Function,
    value: string | number | undefined | Array<string | number> | Function,
    comparisonOperator: ComparisonOperators | LogicalOperators,
    logicalOperator: LogicalOperators
  ) {
    // Nested where statement wrapped in parentheses
    if (column instanceof Function) {
      const builder = new QueryBuilder();
      column(builder);

      const sql = (this.#wheres.length > 0 ? this.#compiler.getOperator(logicalOperator) : '')
        + `(${builder.#compiler.compileWere(true)})`;

      this.#wheres.push(sql);
    }
    // Sub-select within the query
    else if (value instanceof Function) {
      const builder = new QueryBuilder();
      value(builder);

      const sql = (this.#wheres.length > 0 ? this.#compiler.getOperator(logicalOperator) : '')
        + `${column} ${comparisonOperator} (${builder.getSQL()})`;

      this.#wheres.push(sql);
    } else {
      this.#wheres.push(
        new Where(
          column,
          value,
          comparisonOperator,
          this.#wheres.length ? logicalOperator : null
        )
      );
    }

    return this;
  }

  where(
    column: string | WhereQueryBuilderCallback,
    value: string | number | QueryBuilderCallback | undefined = undefined,
    comparisonOperator: ComparisonOperators | LogicalOperators = '='
  ) {
    return this.setWhere(column, value, comparisonOperator, 'AND');
  }

  orWhere(
    column: string | WhereQueryBuilderCallback,
    value: string | number | QueryBuilderCallback | undefined = undefined,
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
    value: Array<string | number> | QueryBuilderCallback
  ) {
    return this.setWhere(column, value, 'IN', 'AND');
  }

  orWhereIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ) {
    return this.setWhere(column, value, 'IN', 'OR');
  }

  whereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ) {
    return this.setWhere(column, value, 'NOT IN', 'AND');
  }

  orWhereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ) {
    return this.setWhere(column, value, 'NOT IN', 'OR');
  }

  whereIsNull(column: string) {
    return this.where(column, undefined, 'IS NULL');
  }

  orWhereIsNull(column: string) {
    return this.orWhere(column, undefined, 'IS NULL');
  }

  whereIsNotNull(column: string) {
    return this.where(column, undefined, 'IS NOT NULL');
  }

  orWhereIsNotNull(column: string) {
    return this.orWhere(column, undefined, 'IS NOT NULL');
  }

  whereRaw(sql: string, ...args: Array<string | number>) {
    this.#wheres.push(
      new RawSQL(sql, args)
    );
    return this;
  }

  join(join: JoinQueryBuilderCallback) {
    this.#joins.push(join);

    return this;
  }

  leftJoin(
    table: string,
    column1: string,
    column2: string,
    alias: string | undefined = undefined
  ) {
    return this.join(builder => {
      builder
        .leftJoin(table, alias)
        .on(column1, column2)
    });
  }

  rightJoin(
    table: string,
    column1: string,
    column2: string,
    alias: string | undefined = undefined
  ) {
    return this.join(builder => {
      builder
        .rightJoin(table, alias)
        .on(column1, column2)
    });
  }

  innerJoin(
    table: string,
    column1: string,
    column2: string,
    alias: string | undefined = undefined
  ) {
    return this.join(builder => {
      builder
        .innerJoin(table, alias)
        .on(column1, column2)
    });
  }

  joinRaw(sql: string, ...args: Array<string | number>) {
    this.#joins.push(
      new RawSQL(sql, args)
    );
    return this;
  }

  groupBy(column: string) {
    if (!this.#groupByColumns.includes(column)) {
      this.#groupByColumns.push(column.trim())
    }

    return this;
  }

  groupByRaw(sql: string, ...args: Array<string | number>) {
    this.#groupByColumns.push(
      new RawSQL(sql, args)
    )

    return this;
  }

  isDistinct() {
    return this.#distinctSelect;
  }

  getSelects() {
    return this.#selects;
  }

  getTables() {
    return this.#tables;
  }

  getWheres() {
    return this.#wheres;
  }

  getJoins() {
    return this.#joins;
  }

  getGroupBy() {
    return this.#groupByColumns;
  }

  getSQL() {
    const sql = [
      this.#compiler.compileSelect(),
      this.#compiler.compileFrom(),
      this.#compiler.compileJoin(),
      this.#compiler.compileWere(),
      this.#compiler.compileGroupBy()
    ];

    return sql
      .filter(Boolean)
      .join(' ')
      .trim();
  }
}
