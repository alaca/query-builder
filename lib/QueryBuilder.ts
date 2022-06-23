import {format} from 'node:util';
import {RawSQL, Select, Where} from './clauses';
import {DatabaseInstance, ColumnAlias, ComparisonOperators, LogicalOperators} from '../types';

export class QueryBuilder {
    private tableName: string;
    private selects: (Select | RawSQL)[] = [];
    private wheres: (Where | RawSQL | string)[] = [];
    private includeSelectKeyword: boolean = true;
    private includeWhereKeyword: boolean = true;
    private selectDistinct: boolean = false;
    // private database: DatabaseInstance;
    //
    // constructor(database: DatabaseInstance) {
    //     this.database = database;
    // }

    from(table: string) {
        this.tableName = table;
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
        this.selectDistinct = true;
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

            const sql = format(
                '%s (%s)',
                this.wheres.length ? logicalOperator : '',
                builder._getWhereSQL()
            );

            this.wheres.push(sql);
        }
        // Sub-select within the query
        else if (value instanceof Function) {
            const builder = new QueryBuilder();
            value(builder);

            const sql = format(
                '%s %s %s (%s)',
                this.wheres.length ? logicalOperator : '',
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
        column: string | Function,
        value: string | number | Array<string | number> | Function = null,
        comparisonOperator: ComparisonOperators | LogicalOperators = '='
    ) {
        this.setWhere(column, value, comparisonOperator, 'AND');
        return this;
    }

    orWhere(
        column: string | Function,
        value: string | number | Array<string | number> | Function = null,
        comparisonOperator: ComparisonOperators | LogicalOperators = '='
    ) {
        this.setWhere(column, value, comparisonOperator, 'OR');
        return this;
    }

    whereBetween(
        column: string,
        min: string | number,
        max: string | number
    ) {
        this.where(column, [min, max], 'BETWEEN');
        return this;
    }

    whereNotBetween(
        column: string,
        min: string | number,
        max: string | number
    ) {
        this.where(column, [min, max], 'NOT BETWEEN');
        return this;
    }

    orWhereBetween(
        column: string,
        min: string | number,
        max: string | number
    ) {
        this.orWhere(column, [min, max], 'BETWEEN');
        return this;
    }

    orWhereNotBetween(
        column: string,
        min: string | number,
        max: string | number
    ) {
        this.orWhere(column, [min, max], 'NOT BETWEEN');
        return this;
    }

    _getSelectSQL() {
        const selects: string[] = [];

        // Select all if nothing is selected
        if (!this.selects.length) {
            this.select('*');
        }

        this.selects.forEach((select, i) => {
            if (select instanceof RawSQL) {
                if (i === 0) {
                    this.includeSelectKeyword = false;
                }
                return selects.push(select.sql);
            }

            if (select.alias) {
                return selects.push(`${select.column} AS ${select.alias}`);
            }

            selects.push(select.column);
        });

        const statements = selects.join(', ');

        if (this.includeSelectKeyword) {
            let sql = 'SELECT ';

            if (this.selectDistinct) {
                sql += 'DISTINCT ';
            }

            return sql + statements;
        }

        return statements;
    }

    _getWhereSQL() {
        const wheres = [];

        this.wheres.forEach((where, i) => {
            if (where instanceof RawSQL) {
                if (i === 0) {
                    this.includeWhereKeyword = false;
                }

                return wheres.push(where.sql);
            }

            if (where instanceof Where) {
                return wheres.push(
                    this.buildWhereSQL(where)
                );
            }

            wheres.push(where);
        });

        const statements = wheres.join(' ');

        if (this.includeWhereKeyword) {
            return 'WHERE ' + statements;
        }

        return statements;
    }


    private buildWhereSQL(where: Where) {
        switch (where.comparisonOperator) {
            case 'BETWEEN':
            case 'NOT BETWEEN':
                return format(
                    `%s %s %s '%s' AND '%s'`,
                    where.logicalOperator ?? '',
                    where.column,
                    where.comparisonOperator,
                    where.value[0],
                    where.value[1]
                );

            case 'IN':
            case 'NOT IN':
                return format(
                    `%s %s %s ('%s')`,
                    where.logicalOperator ?? '',
                    where.column,
                    where.comparisonOperator,
                    // @ts-ignore
                    where.value?.join(`','`)
                );
            default:
                return format(
                    `%s %s %s '%s'`,
                    where.logicalOperator ?? '',
                    where.column,
                    where.comparisonOperator,
                    where.value
                );
        }
    }

    getSQL() {
        return [
            this._getSelectSQL(),
            this._getWhereSQL()
        ].join(' ');
    }
}
