import {format} from 'node:util';
import {escapeString} from './util/String';
import {LogicalOperators} from '../types';
import {RawSQL, Where} from './clauses';
import {QueryBuilder} from './QueryBuilder';

export class QueryCompiler {
  private builder: QueryBuilder;

  constructor(builder: QueryBuilder) {
    this.builder = builder;
  }

  compileSelect() {
    let statements: string[] = [];
    let includeSelectKeyword: boolean = true;

    this.builder
      .getSelects()
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
      return 'SELECT ' + (this.builder.isDistinct() ? 'DISTINCT ' : '') + compiled;
    }

    return compiled;
  }

  compileFrom() {
    let clauses: string[] = [];

    this.builder
      .getFrom()
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

    this.builder
      .getWheres()
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
    switch (where.comparisonOperator) {
      case 'BETWEEN':
      case 'NOT BETWEEN':
        return this.getOperator(where.logicalOperator) + format(
          `%s %s %s AND %s`,
          where.column,
          where.comparisonOperator,
          escapeString(where.value[0]),
          escapeString(where.value[1])
        );

      case 'IN':
      case 'NOT IN':
        return this.getOperator(where.logicalOperator) + format(
          `%s %s ('%s')`,
          where.column,
          where.comparisonOperator,
          // @ts-ignore
          where.value?.join(`','`)
        );

      default:
        return this.getOperator(where.logicalOperator) + format(
          `%s %s %s`,
          where.column,
          where.comparisonOperator,
          escapeString(where.value)
        );
    }
  }

  getOperator(operator: LogicalOperators): string {
    return operator
      ? operator + ' '
      : '';
  }
}
