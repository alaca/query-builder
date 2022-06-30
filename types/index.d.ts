export type DatabaseConfig = {
  client: string
}

export type ColumnAlias = {
  [key: string]: string
}

export type ComparisonOperators =
  '='
  | '>'
  | '<'
  | '>='
  | '<='
  | '<>'
  | '!=';

export type LogicalOperators =
  'AND'
  | 'ON'
  | 'OR'
  | 'LIKE'
  | 'NOT LIKE'
  | 'IN'
  | 'NOT IN'
  | 'BETWEEN'
  | 'NOT BETWEEN'
  | 'IS NULL'
  | 'IS NOT NULL'
  | 'EXISTS'
  | 'NOT EXISTS';

export type JoinTypes =
  'INNER'
  | 'LEFT'
  | 'RIGHT';

export type JoinOperators =
  'ON'
  | 'AND'
  | 'OR';

export type SortDirection = 'ASC' | 'DESC';

export type QueryBuilder = QueryBuilderInterface & WhereQueryBuilderInterface

interface QueryBuilderInterface {
  from(table: string, alias?: string): QueryBuilder

  select(...columns: (string | ColumnAlias)[]): QueryBuilder

  selectRaw(sql: string, ...args: Array<string | number>): QueryBuilder

  distinct(): QueryBuilder

  join(join: JoinQueryBuilderCallback): QueryBuilder

  leftJoin(
    table: string,
    column1: string,
    column2: string,
    alias?: string
  ): QueryBuilder

  rightJoin(
    table: string,
    column1: string,
    column2: string,
    alias?: string
  ): QueryBuilder

  innerJoin(
    table: string,
    column1: string,
    column2: string,
    alias?: string
  ): QueryBuilder

  joinRaw(sql: string, ...args: Array<string | number>): QueryBuilder

  groupBy(column: string): QueryBuilder

  getSQL(): string
}

interface WhereQueryBuilderInterface {
  where(
    column: string | WhereQueryBuilderCallback,
    value?: string | number | QueryBuilderCallback | undefined,
    comparisonOperator?: ComparisonOperators | LogicalOperators
  ): QueryBuilder

  orWhere(
    column: string | WhereQueryBuilderCallback,
    value?: string | number | QueryBuilderCallback | null,
    comparisonOperator?: ComparisonOperators | LogicalOperators
  ): QueryBuilder

  whereLike(column: string, value: string): QueryBuilder

  orWhereLike(column: string, value: string): QueryBuilder

  whereNotLike(column: string, value: string): QueryBuilder

  orWhereNotLike(column: string, value: string): QueryBuilder

  whereBetween(
    column: string,
    min: string | number,
    max: string | number
  ): QueryBuilder

  whereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ): QueryBuilder

  orWhereBetween(
    column: string,
    min: string | number,
    max: string | number
  ): QueryBuilder

  orWhereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ): QueryBuilder

  whereIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ): QueryBuilder

  orWhereIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ): QueryBuilder

  whereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ): QueryBuilder

  orWhereNotIn(
    column: string,
    value: Array<string | number> | QueryBuilderCallback
  ): QueryBuilder

  whereIsNull(column: string): QueryBuilder

  orWhereIsNull(column: string): QueryBuilder

  whereIsNotNull(column: string): QueryBuilder

  orWhereIsNotNull(column: string): QueryBuilder

  whereRaw(sql: string, ...args: Array<string | number>): QueryBuilder
}

interface JoinQueryBuilderInterface {
  on(
    column1: string,
    column2: string | number,
    comparisonOperator?: ComparisonOperators,
    quoteValue?: boolean
  ): JoinQueryBuilderInterface

  and(
    column1: string,
    column2: string | number,
    comparisonOperator?: ComparisonOperators,
    quoteValue?: boolean
  ): JoinQueryBuilderInterface

  or(
    column1: string,
    column2: string | number,
    comparisonOperator?: ComparisonOperators,
    quoteValue?: boolean
  ): JoinQueryBuilderInterface

  leftJoin(table: string, alias?: string | undefined): JoinQueryBuilderInterface

  rightJoin(table: string, alias?: string | undefined): JoinQueryBuilderInterface

  innerJoin(table: string, alias?: string | undefined): JoinQueryBuilderInterface

  joinRaw(sql: string, ...args: Array<string | number>): JoinQueryBuilderInterface
}

export interface QueryBuilderCallback {
  (builder: QueryBuilder): void;
}

export interface WhereQueryBuilderCallback {
  (builder: WhereQueryBuilderInterface): void;
}

export interface JoinQueryBuilderCallback {
  (builder: JoinQueryBuilderInterface): void;
}
