import {escapeString} from '../util/string';
import {LogicalOperators, Query} from './types';
import {Join, RawSQL, SelectBuilder, Table, Where} from './clauses';
import JoinQueryBuilder from './JoinQueryBuilder';
import QueryBuilder from './QueryBuilder';

export class QueryCompiler {
    private query: Query;

    constructor(query: Query) {
        this.query = query;
    }

    compileSelect() {
        const statements: string[] = [];
        let includeSelectKeyword: boolean = true;

        this.query.select
            .forEach((select, i) => {
                if (select instanceof RawSQL) {
                    if (i === 0) {
                        includeSelectKeyword = false;
                    }
                    return statements.push(select.sql);
                }

                if (select instanceof SelectBuilder) {
                    const builder = new QueryBuilder();
                    select.callback(builder);
                    return statements.push(`(${builder.getSQL()}) AS ${select.column}`);
                }

                if (select.alias) {
                    return statements.push(`${select.column} AS ${select.alias}`);
                }

                statements.push(select.column);
            });

        const compiled = statements.length
            ? statements.join(', ')
            : '*';

        if (includeSelectKeyword) {
            return 'SELECT ' + (this.query.distinct ? 'DISTINCT ' : '') + compiled;
        }

        return compiled;
    }

    compileFrom() {
        const clauses: string[] = [];

        this.query.table
            .forEach((table) => {
                if (table instanceof RawSQL) {
                    return clauses.push(table.sql);
                }

                if (table.alias) {
                    return clauses.push(`${table.name} AS ${table.alias}`);
                }

                clauses.push(table.name);
            });

        return 'FROM ' + clauses.join(', ');
    }

    compileInto() {
        const table: Table | RawSQL = this.query.table[0];
        const tableName = table instanceof RawSQL ? table.sql : table.name;

        return 'INSERT INTO ' + tableName;
    }

    compileWere(nestedStatement: boolean = false) {
        const clauses: string[] = [];
        let includeWhereKeyword: boolean = true;

        if (!this.query.where.length) {
            return null;
        }

        this.query.where
            .forEach((where, i) => {
                if (where instanceof RawSQL) {
                    if (i === 0) {
                        includeWhereKeyword = false;
                    }
                    return clauses.push(where.sql);
                }

                if (where instanceof Where) {
                    return clauses.push(
                        this.compileWhereClause(where),
                    );
                }

                clauses.push(where);
            });

        const compiled = clauses.join(' ');

        if (includeWhereKeyword && !nestedStatement) {
            return 'WHERE ' + compiled;
        }

        return compiled;
    }

    private compileWhereClause(where: Where) {
        const {
            column,
            value,
            comparisonOperator: comparison,
            logicalOperator: logical,
        } = where;

        switch (comparison) {
            case 'LIKE':
            case 'NOT LIKE':
                return (typeof value === 'string')
                    ? this.getOperator(logical) + `${column} ${comparison} ${escapeString(value.includes('%') ? value : `%${value}%`)}`
                    : '';

            case 'BETWEEN':
            case 'NOT BETWEEN':
                return (Array.isArray(value))
                    ? this.getOperator(logical) + `${column} ${comparison} ${escapeString(value[0])} AND ${escapeString(value[1])}`
                    : '';

            case 'IN':
            case 'NOT IN':
                return (Array.isArray(value))
                    ? this.getOperator(logical) + `${column} ${comparison} (${value?.map(v => escapeString(v)).join(',')})`
                    : '';

            default:
                return this.getOperator(logical) + `${column} ${comparison} ${escapeString(value)}`;
        }
    }

    compileJoin() {
        const clauses: string[] = [];

        if (!this.query.join.length) {
            return null;
        }

        this.query.join
            .forEach((callback) => {
                if (callback instanceof RawSQL) {
                    return clauses.push(callback.sql);
                }

                const builder = new JoinQueryBuilder();
                callback(builder);

                // Handle callbacks
                builder
                    .getJoins()
                    .forEach(join => {
                        if (join instanceof RawSQL) {
                            return clauses.push(join.sql);
                        }

                        if (join instanceof Join) {
                            if (join.alias) {
                                return clauses.push(
                                    `${join.type} JOIN ${join.table} ${join.alias}`,
                                );
                            }

                            return clauses.push(
                                `${join.type} JOIN ${join.table}`,
                            );
                        }

                        // JoinCondition
                        clauses.push(
                            `${join.logicalOperator} ${join.column1} ${join.comparisonOperator} ${join.quote ? escapeString(join.column2) : join.column2}`,
                        );
                    });

            });

        return clauses.join(' ');
    }

    compileHaving() {
        const clauses: string[] = [];
        let includeHavingKeyword: boolean = true;

        if (!this.query.having.length) {
            return null;
        }

        this.query.having
            .forEach((having, i) => {
                if (having instanceof RawSQL) {
                    if (i === 0) {
                        includeHavingKeyword = false;
                    }
                    return clauses.push(having.sql);
                }

                const {mathFunction, logicalOperator, comparisonOperator, column, value} = having;

                if (mathFunction) {
                    return clauses.push(
                        this.getOperator(logicalOperator) + `${mathFunction}(${column}) ${comparisonOperator} ${escapeString(value)}`,
                    );
                }

                clauses.push(
                    this.getOperator(logicalOperator) + `${column} ${comparisonOperator} ${escapeString(value)}`,
                );
            });

        const compiled = clauses.join(' ');

        if (includeHavingKeyword) {
            return 'HAVING ' + compiled;
        }

        return compiled;
    }

    compileGroupBy() {
        return this.query.groupBy.length
            ? 'GROUP BY ' + this.query.groupBy.join(', ')
            : null;
    }

    compileOrderBy() {
        const statements: string[] = [];

        if (!this.query.orderBy.length) {
            return null;
        }

        this.query.orderBy
            .forEach((order) => {
                statements.push(
                    `${order.column} ${order.direction}`,
                );
            });

        return 'ORDER BY ' + statements.join(', ');
    }

    compileLimit() {
        return this.query.limit
            ? 'LIMIT ' + this.query.limit
            : null;
    }

    compileOffset() {
        return this.query.limit && this.query.offset
            ? 'OFFSET ' + this.query.offset
            : null;
    }

    compileUnion() {
        const unions: string[] = [];

        if (!this.query.union.length) {
            return null;
        }

        this.query.union
            .forEach((union) => {
                unions.push(
                    (union.all ? 'UNION ALL ' : 'UNION ') + union.builder.getSQL(),
                );
            });

        return unions.join(' ');
    }

    compile() {
        const sql = [];

        switch (this.getQueryType()) {
            case 'SELECT':
                sql.push(
                    this.compileSelect(),
                    this.compileFrom(),
                    this.compileJoin(),
                    this.compileWere(),
                    this.compileGroupBy(),
                    this.compileHaving(),
                    this.compileOrderBy(),
                    this.compileLimit(),
                    this.compileOffset(),
                    this.compileUnion(),
                );

                break;

            case 'INSERT':
                sql.push(
                    this.compileInto(),
                    // get data
                    this.compileWere(),
                );

                break;

            case 'UPDATE':

                break;

            case 'DELETE':

                break;
        }

        return sql
            .filter(Boolean)
            .join(' ')
            .trim();
    }

    getQueryType(): string {
        return this.query.type || 'SELECT';
    }

    getOperator(operator: LogicalOperators | null): string {
        return operator
            ? operator + ' '
            : '';
    }
}
