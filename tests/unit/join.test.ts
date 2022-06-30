import QueryBuilder from '../../src';
import JoinQueryBuilder from '../../src/JoinQueryBuilder';

test('advanced join', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .join(qb => {

      expect(qb).toBeInstanceOf(JoinQueryBuilder);

      qb
        .leftJoin('another_table')
        .on('id', 'another_id')
        .and( 'other_column', 'something')
        .or( 'other_column', 'other_thing')
    })
    .getSQL();

    expect(sql).toBe("SELECT * FROM table LEFT JOIN another_table ON id = another_id AND other_column = 'something' OR other_column = 'other_thing'");
});

test('left join', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .leftJoin('another_table', 'id', 'another_id')
    .getSQL();

  expect(sql).toBe('SELECT * FROM table LEFT JOIN another_table ON id = another_id');
});

test('left join alias', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .leftJoin('another_table', 'id', 'another_id', 'at')
    .getSQL();

  expect(sql).toBe('SELECT * FROM table LEFT JOIN another_table at ON id = another_id');
});

test('right join', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .rightJoin('another_table', 'id', 'another_id')
    .getSQL();

  expect(sql).toBe('SELECT * FROM table RIGHT JOIN another_table ON id = another_id');
});

test('right join alias', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .rightJoin('another_table', 'id', 'another_id', 'at')
    .getSQL();

  expect(sql).toBe('SELECT * FROM table RIGHT JOIN another_table at ON id = another_id');
});


test('inner join', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .innerJoin('another_table', 'id', 'another_id')
    .getSQL();

  expect(sql).toBe('SELECT * FROM table INNER JOIN another_table ON id = another_id');
});

test('inner join alias', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .innerJoin('another_table', 'id', 'another_id', 'at')
    .getSQL();

  expect(sql).toBe('SELECT * FROM table INNER JOIN another_table at ON id = another_id');
});
