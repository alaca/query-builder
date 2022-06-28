import {QueryBuilder} from '../../src';

test('select from', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .getSQL();

  expect(sql).toBe('SELECT * FROM table');
});

test('select from using alias', () => {
  const sql = (new QueryBuilder())
    .from('table', 't')
    .getSQL();

  expect(sql).toBe('SELECT * FROM table AS t');
});


test('select from multiple tables', () => {
  const sql = (new QueryBuilder())
    .from('table_one')
    .from('table_two')
    .getSQL();

  expect(sql).toBe('SELECT * FROM table_one, table_two');
});
