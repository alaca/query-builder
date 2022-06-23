import {Database} from '../lib/Database';
import {QueryBuilder} from "../lib/QueryBuilder";

export type DatabaseInstance = InstanceType<typeof Database>;

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


interface WhereQueryBuilder {
  where(
    column: string | WhereQueryBuilderCallback,
    value?: string | number | Array<string | number> | Function,
    comparisonOperator?: ComparisonOperators | LogicalOperators
  ): WhereQueryBuilder

  orWhere(
    column: string | Function,
    value?: string | number | Array<string | number> | Function,
    comparisonOperator?: ComparisonOperators | LogicalOperators
  ): WhereQueryBuilder

  whereBetween(
    column: string,
    min: string | number,
    max: string | number
  ): WhereQueryBuilder

  whereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ): WhereQueryBuilder

  orWhereBetween(
    column: string,
    min: string | number,
    max: string | number
  ): WhereQueryBuilder

  orWhereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ): WhereQueryBuilder
}

export interface WhereQueryBuilderCallback {
  (builder: WhereQueryBuilder): void;
}

export interface QueryBuilderCallback {
  (builder: QueryBuilder): void;
}
