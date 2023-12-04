import {Data, Having, OrderBy, RawSQL, Select, SelectBuilder, Table, Union, Where} from './clauses';
import {QueryCompiler} from './QueryCompiler';
import {
    Column,
    ComparisonOperators,
    DataType,
    JoinQueryBuilderCallback,
    LogicalOperators,
    MathFunctions,
    Query,
    QueryBuilder as QueryBuilderInterface,
    QueryBuilderCallback,
    QueryType,
    SortDirection,
    WhereQueryBuilderCallback,
} from './types';

export default class QueryBuilder implements QueryBuilderInterface {
    #compiler: QueryCompiler;

    protected query: Query = {
        type: null,
        select: [],
        data: [],
        table: [],
        where: [],
        join: [],
        having: [],
        groupBy: [],
        orderBy: [],
        union: [],
        distinct: false,
        limit: false,
        offset: false,
    };

    constructor() {
        this.#compiler = new QueryCompiler(this.query);
    }

    from(table: string, alias?: string) {
        this.query.table.push(
            new Table(table, alias),
        );
        return this;
    }

    into(table: string) {
        this.query.table.push(
            new Table(table),
        );
        return this;
    }

    select(...columns: (string | Column)[]) {
        this.setQueryType('SELECT');

        columns.map(column => {
            if (column instanceof Object) {
                return Object.entries(column).map(([name, value]) => {
                    // subquery
                    if (value instanceof Function) {
                        this.query.select.push(
                            new SelectBuilder(name, value),
                        );
                    }
                    // alias
                    else {
                        this.query.select.push(
                            new Select(name, value),
                        );
                    }
                });
            }

            this.query.select.push(
                new Select(column),
            );
        });

        return this;
    }

    selectRaw(sql: string, ...args: Array<string | number>) {
        this.setQueryType('SELECT');
        this.query.select.push(
            new RawSQL(sql, args),
        );
        return this;
    }

    private set(data: (DataType | DataType[])) {
        if (Array.isArray(data)) {
            data.map(row => {
                Object.entries(row).map(([key, value]) => {
                    this.query.data.push(
                        [new Data(key, value)],
                    );
                });
            });

            return this;
        }

        Object.entries(data).map(([key, value]) => {
            this.query.data.push(
                new Data(key, value),
            );
        });

        return this;
    }

    insert(data: (DataType | DataType[])) {
        this.setQueryType('INSERT');
        return this.set(data);
    }

    insertRaw(sql: string, ...args: Array<string | number>) {
        this.setQueryType('INSERT');
        this.query.data.push(
            new RawSQL(sql, args),
        );
        return this;
    }

    update(data: DataType) {
        this.setQueryType('UPDATE');
        return this.set(data);
    }

    updateRaw(sql: string, ...args: Array<string | number>) {
        this.setQueryType('UPDATE');
        this.query.data.push(
            new RawSQL(sql, args),
        );
        return this;
    }

    delete() {
        this.setQueryType('DELETE');
    }

    distinct() {
        this.query.distinct = true;
        return this;
    }

    private setWhere(
        column: string | Function,
        value: string | number | undefined | Array<string | number> | Function,
        comparisonOperator: ComparisonOperators | LogicalOperators,
        logicalOperator: 'AND' | 'OR',
    ) {
        // Nested where statement wrapped in parentheses
        if (column instanceof Function) {
            const builder = new QueryBuilder();
            column(builder);

            const sql = (this.query.where.length > 0 ? this.#compiler.getOperator(logicalOperator) : '')
                + `(${builder.#compiler.compileWere(true)})`;

            this.query.where.push(sql);
        }
        // Sub-select within the query
        else if (value instanceof Function) {
            const builder = new QueryBuilder();

            value(builder);

            const sql = (this.query.where.length > 0 ? this.#compiler.getOperator(logicalOperator) : '')
                + `${column} ${comparisonOperator} (${builder.getSQL()})`;

            this.query.where.push(sql);
        } else {
            this.query.where.push(
                new Where(
                    column,
                    value,
                    comparisonOperator,
                    this.query.where.length ? logicalOperator : null,
                ),
            );
        }

        return this;
    }

    where(
        column: string | WhereQueryBuilderCallback,
        value: string | number | QueryBuilderCallback | undefined = undefined,
        comparisonOperator: ComparisonOperators | LogicalOperators = '=',
    ) {
        return this.setWhere(column, value, comparisonOperator, 'AND');
    }

    orWhere(
        column: string | WhereQueryBuilderCallback,
        value: string | number | QueryBuilderCallback | undefined = undefined,
        comparisonOperator: ComparisonOperators | LogicalOperators = '=',
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
        max: string | number,
    ) {
        return this.setWhere(column, [min, max], 'BETWEEN', 'AND');
    }

    whereNotBetween(
        column: string,
        min: string | number,
        max: string | number,
    ) {
        return this.setWhere(column, [min, max], 'NOT BETWEEN', 'AND');
    }

    orWhereBetween(
        column: string,
        min: string | number,
        max: string | number,
    ) {
        return this.setWhere(column, [min, max], 'BETWEEN', 'OR');
    }

    orWhereNotBetween(
        column: string,
        min: string | number,
        max: string | number,
    ) {
        return this.setWhere(column, [min, max], 'NOT BETWEEN', 'OR');
    }

    whereIn(
        column: string,
        value: Array<string | number> | QueryBuilderCallback,
    ) {
        return this.setWhere(column, value, 'IN', 'AND');
    }

    orWhereIn(
        column: string,
        value: Array<string | number> | QueryBuilderCallback,
    ) {
        return this.setWhere(column, value, 'IN', 'OR');
    }

    whereNotIn(
        column: string,
        value: Array<string | number> | QueryBuilderCallback,
    ) {
        return this.setWhere(column, value, 'NOT IN', 'AND');
    }

    orWhereNotIn(
        column: string,
        value: Array<string | number> | QueryBuilderCallback,
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
        this.query.where.push(
            new RawSQL(sql, args),
        );
        return this;
    }

    join(builder: JoinQueryBuilderCallback) {
        this.query.join.push(builder);
        return this;
    }

    leftJoin(
        table: string,
        primaryKey: string,
        foreignKey: string,
        alias?: string,
    ) {
        return this.join(builder => {
            builder
                .leftJoin(table, alias)
                .on(primaryKey, foreignKey);
        });
    }

    rightJoin(
        table: string,
        primaryKey: string,
        foreignKey: string,
        alias?: string,
    ) {
        return this.join(builder => {
            builder
                .rightJoin(table, alias)
                .on(primaryKey, foreignKey);
        });
    }

    innerJoin(
        table: string,
        primaryKey: string,
        foreignKey: string,
        alias?: string,
    ) {
        return this.join(builder => {
            builder
                .innerJoin(table, alias)
                .on(primaryKey, foreignKey);
        });
    }

    crossJoin(
        table: string,
        primaryKey: string,
        foreignKey: string,
        alias?: string,
    ) {
        return this.join(builder => {
            builder
                .crossJoin(table, alias)
                .on(primaryKey, foreignKey);
        });
    }

    joinRaw(sql: string, ...args: Array<string | number>) {
        this.query.join.push(
            new RawSQL(sql, args),
        );
        return this;
    }

    having(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
        mathFunction?: MathFunctions | undefined,
    ) {
        this.query.having.push(
            new Having(
                column,
                comparisonOperator,
                value,
                this.query.having.length ? 'AND' : null,
                mathFunction,
            ),
        );
        return this;
    }

    orHaving(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
        mathFunction?: MathFunctions | undefined,
    ) {
        this.query.having.push(
            new Having(
                column,
                comparisonOperator,
                value,
                this.query.having.length ? 'OR' : null,
                mathFunction,
            ),
        );
        return this;
    }

    havingCount(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.having(column, comparisonOperator, value, 'COUNT');
    }

    orHavingCount(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.orHaving(column, comparisonOperator, value, 'COUNT');
    }

    havingMin(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.having(column, comparisonOperator, value, 'MIN');
    }

    orHavingMin(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.orHaving(column, comparisonOperator, value, 'MIN');
    }

    havingMax(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.having(column, comparisonOperator, value, 'MAX');
    }

    orHavingMax(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.orHaving(column, comparisonOperator, value, 'MAX');
    }

    havingAvg(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.having(column, comparisonOperator, value, 'AVG');
    }

    orHavingAvg(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.orHaving(column, comparisonOperator, value, 'AVG');
    }

    havingSum(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.having(column, comparisonOperator, value, 'SUM');
    }

    orHavingSum(
        column: string,
        comparisonOperator: ComparisonOperators,
        value: string | number,
    ) {
        return this.orHaving(column, comparisonOperator, value, 'SUM');
    }

    havingRaw(sql: string, ...args: Array<string | number>) {
        this.query.having.push(
            new RawSQL(sql, args),
        );
        return this;
    }

    groupBy(column: string) {
        this.query.groupBy.push(column.trim());
        return this;
    }

    orderBy(column: string, direction: SortDirection = 'ASC') {
        this.query.orderBy.push(
            new OrderBy(column, direction),
        );
        return this;
    }

    limit(limit: number) {
        this.query.limit = limit;
        return this;
    }

    offset(offset: number) {
        this.query.offset = offset;
        return this;
    }

    union(...unions: QueryBuilder[]) {
        unions.forEach(builder => {
            this.query.union.push(
                new Union(builder),
            );
        });
        return this;
    }

    unionAll(...unions: QueryBuilder[]) {
        unions.forEach(builder => {
            this.query.union.push(
                new Union(builder, true),
            );
        });
        return this;
    }

    protected setQueryType(type: QueryType) {
        if (this.query.type) {
            throw new Error('Query type already set');
        }

        this.query.type = type;
    }

    getSQL() {
        return this.#compiler.compile();
    }
}
