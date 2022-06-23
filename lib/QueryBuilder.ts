import {format} from 'node:util';
import {RawSQL, Select, Where} from './clauses';
import {
  DatabaseInstance,
  ColumnAlias,
  ComparisonOperators,
  LogicalOperators,
  WhereQueryBuilder,
  WhereQueryBuilderCallback, QueryBuilderCallback
} from '../types';
import {QueryCompiler} from "./QueryCompiler";

export class QueryBuilder {
  private tableName: string;
  private selects: (Select | RawSQL)[] = [];
  private wheres: (Where | RawSQL | string)[] = [];
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

      const sql = QueryCompiler.getQueryOperator(logicalOperator) + format(
        '(%s)',
        builder
          .getWhereSQL()
          .replace('WHERE ', '') // Remove the starting WHERE keyword for nested statements
      );

      this.wheres.push(sql);
    }
    // Sub-select within the query
    else if (value instanceof Function) {
      const builder = new QueryBuilder();
      value(builder);

      const sql = QueryCompiler.getQueryOperator(logicalOperator) + format(
        '%s %s (%s)',
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
    column: string | WhereQueryBuilderCallback,
    value: string | number | Array<string | number> | QueryBuilderCallback = null,
    comparisonOperator: ComparisonOperators | LogicalOperators = '='
  ) {
    this.setWhere(column, value, comparisonOperator, 'AND');
    return this;
  }

  orWhere(
    column: string | WhereQueryBuilderCallback,
    value: string | number | Array<string | number> | QueryBuilderCallback = null,
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
    return this.where(column, [min, max], 'BETWEEN');
  }

  whereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.where(column, [min, max], 'NOT BETWEEN');
  }

  orWhereBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.orWhere(column, [min, max], 'BETWEEN');
  }

  orWhereNotBetween(
    column: string,
    min: string | number,
    max: string | number
  ) {
    return this.orWhere(column, [min, max], 'NOT BETWEEN');
  }

  private getSelectSQL() {
    return QueryCompiler.compileSelectStatements(this.selects, this.selectDistinct);
  }

  private getWhereSQL() {
    return QueryCompiler.compileWereClauses(this.wheres);
  }

  getSQL() {
    return [
      this.getSelectSQL(),
      this.getWhereSQL()
    ].join(' ');
  }
}
