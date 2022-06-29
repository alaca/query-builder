import QueryBuilder from '../query/QueryBuilder';
import {DatabaseConfig} from '../../types';

export default class Database {
  #builder: QueryBuilder & {
    get: () => Promise<void>;
    getAll: () => Promise<void>;
  };

  constructor(config: DatabaseConfig) {

    // Connect to database

    this.#builder = Object.assign(
      new QueryBuilder(),
      {
        get: () => this.get(),
        getAll: () => this.getAll()
      }
    );
  }

  table(table: string) {
    return this.#builder.from(table);
  }

  async query(sql: string, args?: (string | number)[]) {

  }

  async get() {
    const sql = this.#builder.getSQL();
  }

  async getAll() {
    const sql = this.#builder.getSQL();
  }
}

