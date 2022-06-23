import {Database} from '../lib/Database';

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

