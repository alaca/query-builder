import QueryBuilder from '../../src';

test('select where', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .where('id', 10)
    .getSQL();

  expect(sql).toBe('SELECT * FROM table WHERE id = 10');
});
