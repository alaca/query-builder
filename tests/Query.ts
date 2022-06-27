import QueryBuilder from '../src/query/QueryBuilder';

const query = new QueryBuilder();

const sql = query
  .select('id', 'name', 'age')
  .from('people')
  .where('id', 12)
  .rightJoin('right', 'id', 'rid')
  .join(qb => {
    qb
      .leftJoin('ajme')
      .on('aaa', 'beee')
      .and('ceee', 'dd')
      .or('dee', 'gg')
  })
  .getSQL();

console.log(sql)
