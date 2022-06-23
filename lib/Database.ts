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
    .select('id')
    .from('table')
    .where('id', 5)
    .orWhere('ajme', 'nije')
    .whereBetween('date', 'danas', 'sutra')
    .getSQL();

console.log(l)
