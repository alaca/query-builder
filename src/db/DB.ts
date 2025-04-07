import QueryBuilder from '../builder/QueryBuilder';

export default class DB {
    static table(table: string, alias?: string): QueryBuilder {
        return (new QueryBuilder()).table(table, alias);
    }
}
