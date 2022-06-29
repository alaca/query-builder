import QueryBuilder from '../src/query/QueryBuilder'
import JoinQueryBuilder from '../src/query/JoinQueryBuilder'

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

export interface QueryBuilderCallback {
  (builder: QueryBuilder): void;
}

export interface WhereQueryBuilderCallback {
  (builder: QueryBuilder & JoinQueryBuilder): void;
}

export interface JoinQueryBuilderCallback {
  (builder: JoinQueryBuilder): void;
}
