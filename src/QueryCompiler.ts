import {escapeString} from './util/string';
import {LogicalOperators} from '../types';
import {Join, RawSQL, Where} from './clauses';
import QueryBuilder from './QueryBuilder';
import JoinQueryBuilder from './JoinQueryBuilder';

export class QueryCompiler {
  #builder: QueryBuilder;

  constructor(builder: QueryBuilder) {
    this.#builder = builder;
  }

  compileSelect() {
    let statements: string[] = [];
    let includeSelectKeyword: boolean = true;

    this.#builder
      ._getSelects()
      .forEach((select, i) => {
        if (select instanceof RawSQL) {
          if (i === 0) {
            includeSelectKeyword = false;
          }
          return statements.push(select.sql);
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
      return 'SELECT ' + (this.#builder._isDistinct() ? 'DISTINCT ' : '') + compiled;
    }

    return compiled;
  }

  compileFrom() {
    let clauses: string[] = [];

    this.#builder
      ._getTables()
      .forEach((from) => {
        if (from instanceof RawSQL) {
          return clauses.push(from.sql);
        }

        if (from.alias) {
          return clauses.push(`${from.table} AS ${from.alias}`);
        }

        clauses.push(from.table);
      });

    return 'FROM ' + clauses.join(', ');
  }

  compileWere(nestedStatement: boolean = false) {
    let clauses: string[] = [];
    let includeWhereKeyword: boolean = true;

    if (!this.#builder._getWheres().length) {
      return null;
    }

    this.#builder
      ._getWheres()
      .forEach((where, i) => {
        if (where instanceof RawSQL) {
          if (i === 0) {
            includeWhereKeyword = false;
          }
          return clauses.push(where.sql);
        }

        if (where instanceof Where) {
          return clauses.push(
            this.compileWhereClause(where)
          )
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
    const {column, value, comparisonOperator: comparison, logicalOperator: logical} = where;

    switch (comparison) {
      case 'LIKE':
      case 'NOT LIKE':
        return (typeof value === "string")
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
          ? this.getOperator(logical) + `${column} ${comparison} ('${value?.join(`','`)}')`
          : '';

      default:
        return this.getOperator(logical) + `${column} ${comparison} ${escapeString(value)}`;
    }
  }

  compileJoin() {
    let clauses: string[] = [];

    if (!this.#builder._getJoins().length) {
      return null;
    }

    this.#builder
      ._getJoins()
      .forEach((callback) => {
        if (callback instanceof RawSQL) {
          return clauses.push(callback.sql);
        }

        const builder = new JoinQueryBuilder();
        callback(builder);

        // Handle callbacks
        builder
          ._getJoins()
          .forEach(join => {
            if (join instanceof RawSQL) {
              return clauses.push(join.sql);
            }

            if (join instanceof Join) {
              if (join.alias) {
                return clauses.push(
                  `${join.type} JOIN ${join.table} ${join.alias}`
                )
              }

              return clauses.push(
                `${join.type} JOIN ${join.table}`
              )
            }

            clauses.push(
              `${join.logicalOperator} ${join.column1} ${join.comparisonOperator} ${join.quote ? escapeString(join.column2) : join.column2}`
            );
          });

      });

    return clauses.join(' ');
  }

  compileGroupBy() {
    let statements: string[] = [];
    let includeGroupByKeyword: boolean = true;

    if (!this.#builder._getGroupBy().length) {
      return null;
    }

    this.#builder
      ._getGroupBy()
      .forEach((group, i) => {
        if (group instanceof RawSQL) {
          if (i === 0) {
            includeGroupByKeyword = false;
          }
          return statements.push(group.sql);
        }

        statements.push(group.trim());
      });

    const compiled = statements.join(', ');

    if (includeGroupByKeyword) {
      return 'GROUP BY ' + compiled;
    }

    return compiled;
  }

  getOperator(operator: LogicalOperators | null): string {
    return operator
      ? operator + ' '
      : '';
  }
}
