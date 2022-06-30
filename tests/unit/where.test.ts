import QueryBuilder from '../../src';

test('where', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .where('id', 10)
    .getSQL();

  expect(sql).toBe('SELECT * FROM table WHERE id = 10');
});

test('where and where', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .where('id', 10)
    .where('status', 'published')
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE id = 10 AND status = 'published'");
});

test('where or where', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .where('status', 'published')
    .orWhere('status', 'completed')
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE status = 'published' OR status = 'completed'");
});

test('where like', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereLike('status', 'something')
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE status LIKE '%something%'");
});

test('where like left wild card', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereLike('status', '%something')
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE status LIKE '%something'");
});

test('where like right wild card', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereLike('status', 'something%')
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE status LIKE 'something%'");
});

test('where like or like', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereLike('status', 'something')
    .orWhereLike('status', 'some other thing')
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE status LIKE '%something%' OR status LIKE '%some other thing%'");
});

test('where not like', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereNotLike('status', 'something')
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE status NOT LIKE '%something%'");
});

test('where not like or not like', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereNotLike('status', 'something')
    .orWhereNotLike('status', 'some other thing')
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE status NOT LIKE '%something%' OR status NOT LIKE '%some other thing%'");
});

test('where between', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereBetween('id', 10, 100)
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE id BETWEEN 10 AND 100");
});

test('where between or between', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereBetween('id', 10, 100)
    .orWhereBetween('id', 200, 300)
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE id BETWEEN 10 AND 100 OR id BETWEEN 200 AND 300");
});

test('where not between', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereNotBetween('id', 10, 100)
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE id NOT BETWEEN 10 AND 100");
});

test('where in', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereIn('id', [10, 100])
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE id IN (10,100)");
});

test('where in string', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereIn('status', ['open', 'closed'])
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE status IN ('open','closed')");
});

test('where raw', () => {
  const sql = (new QueryBuilder())
    .from('table')
    .whereRaw('WHERE something = 0')
    .getSQL();

  expect(sql).toBe("SELECT * FROM table WHERE something = 0");
});
