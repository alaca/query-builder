import {QueryBuilder} from '../lib/QueryBuilder';

const query = new QueryBuilder();

const sql = query
  .select('id', 'name', 'age')
  .from('people')
  .where('id', 12)
  .getSQL();

console.log(sql)
