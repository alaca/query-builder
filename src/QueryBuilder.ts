import {From, RawSQL, Select, Where, OrderBy, Having, Union} from './clauses';
import {QueryCompiler} from './QueryCompiler';
import {
  ColumnAlias,
  ComparisonOperators,
  LogicalOperators,
  QueryBuilderCallback,
  WhereQueryBuilderCallback,
  JoinQueryBuilderCallback,
  SortDirection,
  MathFunctions,
  QueryBuilder as QueryBuilderInterface
} from '../types';

export default class QueryBuilder implements QueryBuilderInterface {
  #compiler: QueryCompiler;
  #selects: (Select | RawSQL)[] = [];
  #tables: (From | RawSQL)[] = [];
  #wheres: (Where | RawSQL | string)[] = [];
  #joins: (RawSQL | JoinQueryBuilderCallback)[] = [];
  #havings: (Having | RawSQL)[] = [];
  #groupByColumns: string[] = [];
  #orderByColumns: OrderBy[] = [];
  #unions: Union[] = [];
  #distinctSelect: boolean = false;
  #limitNumberRows: number | false = false;
  #offsetValue: number | false = false;

  constructor() {
    this.#compiler = new QueryCompiler(this);
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

  #setWhere(
    column: string | Function,
    value: string | number | undefined | Array<string | number> | Function,
    comparisonOperator: ComparisonOperators | LogicalOperators,
    logicalOperator: 'AND' | 'OR'
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
    return this.#setWhere(column, value, comparisonOperator, 'AND');
  }

  orWhere(
    column: string | WhereQueryBuilderCallback,
    value: string | number | QueryBuilderCallback | undefined = undefined,
    comparisonOperator: ComparisonOperators | LogicalOperators = '='
  ) {
    return this.#setWhere(column, value, comparisonOperator, 'OR');
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
    return this.#setWhere(column, [min, max], 'BETWEEN', 'AND');
  }

  whereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.#setWhere(column, [min, max], 'NOT BETWEEN', 'AND');
  }

  orWhereBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.#setWhere(column, [min, max], 'BETWEEN', 'OR');
  }

  orWhereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.#setWhere(column, [min, max], 'NOT BETWEEN', 'OR');
  }

  whereIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ) {
    return this.#setWhere(column, value, 'IN', 'AND');
  }

  orWhereIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ) {
    return this.#setWhere(column, value, 'IN', 'OR');
  }

  whereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ) {
    return this.#setWhere(column, value, 'NOT IN', 'AND');
  }

  orWhereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ) {
    return this.#setWhere(column, value, 'NOT IN', 'OR');
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

  having(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number,
    mathFunction?: MathFunctions | undefined
  ) {
    this.#havings.push(
      new Having(
        column,
        comparisonOperator,
        value,
        this.#havings.length ? 'AND' : null,
        mathFunction
      )
    );
    return this;
  }

  orHaving(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number,
    mathFunction?: MathFunctions | undefined
  ) {
    this.#havings.push(
      new Having(
        column,
        comparisonOperator,
        value,
        this.#havings.length ? 'OR' : null,
        mathFunction
      )
    );
    return this;
  }

  havingCount(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.having(column, comparisonOperator, value, 'COUNT');
  }

  orHavingCount(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.orHaving(column, comparisonOperator, value, 'COUNT');
  }

  havingMin(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.having(column, comparisonOperator, value, 'MIN');
  }

  orHavingMin(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.orHaving(column, comparisonOperator, value, 'MIN');
  }

  havingMax(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.having(column, comparisonOperator, value, 'MAX');
  }

  orHavingMax(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.orHaving(column, comparisonOperator, value, 'MAX');
  }

  havingAvg(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.having(column, comparisonOperator, value, 'AVG');
  }

  orHavingAvg(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.orHaving(column, comparisonOperator, value, 'AVG');
  }

  havingSum(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.having(column, comparisonOperator, value, 'SUM');
  }

  orHavingSum(
    column: string,
    comparisonOperator: ComparisonOperators,
    value: string | number
  ) {
    return this.orHaving(column, comparisonOperator, value, 'SUM');
  }

  havingRaw(sql: string, ...args: Array<string | number>) {
    this.#havings.push(
      new RawSQL(sql, args)
    );
    return this;
  }

  groupBy(column: string) {
    this.#groupByColumns.push(column.trim());
    return this;
  }

  orderBy(column: string, direction: SortDirection = 'ASC') {
    this.#orderByColumns.push(
      new OrderBy(column, direction)
    );
    return this;
  }

  limit(limit: number) {
    this.#limitNumberRows = limit;
    return this;
  }

  offset(offset: number) {
    this.#offsetValue = offset;
    return this;
  }

  union(...unions: QueryBuilder[]) {
    unions.forEach(builder => {
      this.#unions.push(
        new Union(builder)
      )
    });
    return this;
  }

  unionAll(...unions: QueryBuilder[]) {
    unions.forEach(builder => {
      this.#unions.push(
        new Union(builder, true)
      )
    });
    return this;
  }

  _isDistinct() {
    return this.#distinctSelect;
  }

  _getSelects() {
    return this.#selects;
  }

  _getTables() {
    return this.#tables;
  }

  _getWheres() {
    return this.#wheres;
  }

  _getJoins() {
    return this.#joins;
  }

  _getHavings() {
    return this.#havings;
  }

  _getGroupBy() {
    return this.#groupByColumns;
  }

  _getOrderBy() {
    return this.#orderByColumns;
  }

  _getLimit() {
    return this.#limitNumberRows;
  }

  _getOffset() {
    return this.#offsetValue;
  }

  _getUnions() {
    return this.#unions;
  }

  getSQL() {
    const sql = [
      this.#compiler.compileSelect(),
      this.#compiler.compileFrom(),
      this.#compiler.compileJoin(),
      this.#compiler.compileWere(),
      this.#compiler.compileGroupBy(),
      this.#compiler.compileHaving(),
      this.#compiler.compileOrderBy(),
      this.#compiler.compileLimit(),
      this.#compiler.compileOffset(),
      this.#compiler.compileUnion()
    ];

    return sql
      .filter(Boolean)
      .join(' ')
      .trim();
  }
}
