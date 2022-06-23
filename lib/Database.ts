import {QueryBuilder} from './QueryBuilder';

/**
 * Database class
 *
 * @since 1.0.0
 */
export class Database {

  constructor() {

  }

  /**
   * @param {string} table table name
   * @return QueryBuilder
   */
  table(table: string): QueryBuilder {
    return (new QueryBuilder()).from(table);
  }

  query() {

  }

  prepare() {

  }

  get() {

  }

  getAll() {

  }
}


const query = new QueryBuilder();

const l = query
  .distinct()
  .select('id', 'pid', 'uuid')
  .from('table')
  .where('id', 5)
  .where((builder) => {
    builder
      .where('aa', 4)
      .orWhere('bee', 6);
  })
  .orWhere( 'id', (builder) => {
    builder
      .where('22', 4)
      .orWhere('33', 6);
  })
  .orWhere('ajme', 'nije')
  .whereBetween('date', 'danas', 'sutra')
  .getSQL();

console.log(l)
