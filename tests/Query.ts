import {QueryBuilder} from '../lib/QueryBuilder';

const query = new QueryBuilder();

const sql = query
  .select('id', 'name', 'age')
  .from('people')
  .where('id', 5)
  .getSQL();

console.log(sql)
