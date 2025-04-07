import {Data, Having, OrderBy, RawSQL, Select, Table, Union, Where, SelectBuilder} from '../clauses';

export type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | null;

export type Column = {
    [key: string]: string | ((builder: QueryBuilder) => void)
}

export type DataType = {
    [key: string]: string | number
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
    | 'RIGHT'
    | 'CROSS';

export type JoinOperators =
    'ON'
    | 'AND'
    | 'OR';

export type SortDirection = 'ASC' | 'DESC';

export type MathFunctions =
    'SUM'
    | 'MIN'
    | 'MAX'
    | 'COUNT'
    | 'AVG';

export type QueryBuilder = QueryBuilderInterface & WhereQueryBuilderInterface

export type Query = {
    type: QueryType,
    select: (Select | RawSQL | SelectBuilder)[],
    data: (Data | Data[] | RawSQL)[],
    table: (Table | RawSQL)[],
    where: (Where | RawSQL | string)[],
    join: (RawSQL | JoinQueryBuilderCallback)[],
    having: (Having | RawSQL)[],
    groupBy: string[],
    orderBy: OrderBy[],
    union: Union[],
    distinct: boolean,
    limit: number | false,
    offset: number | false,
}

interface QueryBuilderInterface {
    table(table: string, alias?: string): QueryBuilder;

    select(...columns: (string | ColumnAlias)[]): QueryBuilder;

    selectRaw(sql: string, ...args: Array<string | number>): QueryBuilder;

    distinct(): QueryBuilder;

    join(join: JoinQueryBuilderCallback): QueryBuilder;

    leftJoin(
        table: string,
        primaryKey: string,
        foreignKey: string,
        alias?: string,
    ): QueryBuilder;

    rightJoin(
        table: string,
        primaryKey: string,
        foreignKey: string,
        alias?: string,
    ): QueryBuilder;

    innerJoin(
        table: string,
        primaryKey: string,
        foreignKey: string,
        alias?: string,
    ): QueryBuilder;

    crossJoin(
        table: string,
        primaryKey: string,
        foreignKey: string,
        alias?: string,
    ): QueryBuilder;

    joinRaw(sql: string, ...args: Array<string | number>): QueryBuilder;

    having(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
        mathFunction?: MathFunctions | undefined,
    ): QueryBuilder;

    orHaving(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
        mathFunction?: MathFunctions | undefined,
    ): QueryBuilder;

    havingCount(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    orHavingCount(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    havingMin(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    orHavingMin(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    havingMax(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    orHavingMax(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    havingAvg(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    orHavingAvg(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    havingSum(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    orHavingSum(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ): QueryBuilder;

    havingRaw(sql: string, ...args: Array<string | number>): QueryBuilder;

    groupBy(column: string): QueryBuilder;

    orderBy(column: string, direction: SortDirection = 'ASC'): QueryBuilder;

    limit(limit: number): QueryBuilder;

    offset(offset: number): QueryBuilder;

    union(...unions: QueryBuilder[]): QueryBuilder;

    unionAll(...unions: QueryBuilder[]): QueryBuilder;

    getSQL(): string;
}

interface WhereQueryBuilderInterface {
    where(
        column: string | WhereQueryBuilderCallback,
        value?: string | number | QueryBuilderCallback,
        comparisonOperator?: ComparisonOperators | LogicalOperators,
    ): WhereQueryBuilderInterface;

    orWhere(
        column: string | WhereQueryBuilderCallback,
        value?: string | number | QueryBuilderCallback,
        comparisonOperator?: ComparisonOperators | LogicalOperators,
    ): WhereQueryBuilderInterface;

    whereLike(column: string, value: string): WhereQueryBuilderInterface;

    orWhereLike(column: string, value: string): WhereQueryBuilderInterface;

    whereNotLike(column: string, value: string): WhereQueryBuilderInterface;

    orWhereNotLike(column: string, value: string): WhereQueryBuilderInterface;

    whereBetween(
        column: string,
        min: string | number,
        max: string | number,
    ): WhereQueryBuilderInterface;

    whereNotBetween(
        column: string,
        min: string | number,
        max: string | number,
    ): WhereQueryBuilderInterface;

    orWhereBetween(
        column: string,
        min: string | number,
        max: string | number,
    ): WhereQueryBuilderInterface;

    orWhereNotBetween(
        column: string,
        min: string | number,
        max: string | number,
    ): WhereQueryBuilderInterface;

    whereIn(
        column: string,
        value: Array<string | number> | QueryBuilderCallback,
    ): WhereQueryBuilderInterface;

    orWhereIn(
        column: string,
        value: Array<string | number> | QueryBuilderCallback,
    ): QueryBuilder;

    whereNotIn(
        column: string,
        value: Array<string | number> | QueryBuilderCallback,
    ): WhereQueryBuilderInterface;

    orWhereNotIn(
        column: string,
        value: Array<string | number> | QueryBuilderCallback,
    ): WhereQueryBuilderInterface;

    whereIsNull(column: string): WhereQueryBuilderInterface;

    orWhereIsNull(column: string): WhereQueryBuilderInterface;

    whereIsNotNull(column: string): WhereQueryBuilderInterface;

    orWhereIsNotNull(column: string): WhereQueryBuilderInterface;

    whereRaw(sql: string, ...args: Array<string | number>): WhereQueryBuilderInterface;
}

interface JoinQueryBuilderInterface {
    on(
        column1: string,
        column2: string,
        comparisonOperator?: ComparisonOperators,
        quoteValue?: boolean,
    ): JoinQueryBuilderInterface;

    and(
        column1: string,
        column2: string,
        comparisonOperator?: ComparisonOperators,
        quoteValue?: boolean,
    ): JoinQueryBuilderInterface;

    or(
        column1: string,
        column2: string | number,
        comparisonOperator?: ComparisonOperators,
        quoteValue?: boolean,
    ): JoinQueryBuilderInterface;

    leftJoin(table: string, alias?: string): JoinQueryBuilderInterface;

    rightJoin(table: string, alias?: string): JoinQueryBuilderInterface;

    innerJoin(table: string, alias?: string): JoinQueryBuilderInterface;

    crossJoin(table: string, alias?: string): JoinQueryBuilderInterface;

    joinRaw(sql: string, ...args: Array<string | number>): JoinQueryBuilderInterface;
}

export interface QueryBuilderCallback {
    (builder: QueryBuilderInterface): void;
}

export interface WhereQueryBuilderCallback {
    (builder: WhereQueryBuilderInterface): void;
}

export interface JoinQueryBuilderCallback {
    (builder: JoinQueryBuilderInterface ): void;
}
