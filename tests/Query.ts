import {QueryBuilder} from '../lib/QueryBuilder';

const query = new QueryBuilder();

const sql = query
  .distinct()
  .select('id', 'pid', 'uuid')
  .from('table', 'TABLICA')
  .from('table2', 'TABLICA2')
  .where('id', 5)
  .where((builder) => {
    builder
      .where('aa', 4)
      .orWhereIn('sss', ['a', 'be'])
      .whereNotIn('sss', ['a', 'be'])
      .orWhere('bee', 6);
  })
  .orWhere('id', (builder) => {
    builder
      .from('ajme')
      .where('22', 4)
      .orWhere('33', 6);
  })
  .orWhere('ajme', 'nije')
  .whereBetween('date', 'danas', 'sutra')
  .whereIn('date', ['ajme', 'je', 2])
  .whereIn('date', (builder) => {
    builder
      .select('nested')
      .from('pested')
      .where('ojkko', 'pojkko')
  })
  .getSQL();

console.log(sql)
