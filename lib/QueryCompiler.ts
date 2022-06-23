import {RawSQL, Select, Where} from "./clauses";
import {format} from "node:util";
import {LogicalOperators} from "../types";

export class QueryCompiler {
  static compileSelectStatements(selects: Array<Select | RawSQL>, distinct: boolean) {
    let statements: string[] = [];
    let includeSelectKeyword: boolean = true;

    selects.forEach((select, i) => {
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

    const compiled = statements.length ? statements.join(', ') : '*';

    if (includeSelectKeyword) {
      return 'SELECT ' + (distinct ? 'DISTINCT ' : '') + compiled;
    }

    return compiled;
  }

  static compileWereClauses(wheres: Array<Where | RawSQL | string>) {
    let clauses: string[] = [];
    let includeWhereKeyword: boolean = true;

    wheres.forEach((where, i) => {
      if (where instanceof RawSQL) {
        if (i === 0) {
          includeWhereKeyword = false;
        }

        return clauses.push(where.sql);
      }

      if (where instanceof Where) {
        switch (where.comparisonOperator) {
          case 'BETWEEN':
          case 'NOT BETWEEN':
            return clauses.push(this.getQueryOperator(where.logicalOperator) + format(
              `%s %s '%s' AND '%s'`,
              where.column,
              where.comparisonOperator,
              where.value[0],
              where.value[1]
            ));

          case 'IN':
          case 'NOT IN':
            return clauses.push(this.getQueryOperator(where.logicalOperator) + format(
              `%s %s ('%s')`,
              where.column,
              where.comparisonOperator,
              // @ts-ignore
              where.value?.join(`','`)
            ));

          default:
            return clauses.push(this.getQueryOperator(where.logicalOperator) + format(
              `%s %s '%s'`,
              where.column,
              where.comparisonOperator,
              where.value
            ));
        }
      }

      clauses.push(where);
    });

    const compiled = clauses.join(' ');

    if (includeWhereKeyword) {
      return 'WHERE ' + compiled;
    }

    return compiled;
  }

  static getQueryOperator(operator: LogicalOperators): string {
    return operator ? operator + ' ' : '';
  }
}
