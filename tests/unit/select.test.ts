import QueryBuilder from '../../src';

test('select specific columns from table', () => {
    const sql = (new QueryBuilder())
        .select('id', 'name', 'age')
        .from('table')
        .getSQL();

    expect(sql).toBe('SELECT id, name, age FROM table');
});

test('select all columns from table', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .getSQL();

    expect(sql).toBe('SELECT * FROM table');
});

test('select raw statement', () => {
    const sql = (new QueryBuilder())
        .selectRaw('SELECT column_one, column_two')
        .from('table')
        .getSQL();

    expect(sql).toBe('SELECT column_one, column_two FROM table');
});


test('select column alias', () => {
    const sql = (new QueryBuilder())
        .select({id: 'product_id'})
        .from('table')
        .getSQL();

    expect(sql).toBe('SELECT id AS product_id FROM table');
});

test('select distinct', () => {
    const sql = (new QueryBuilder())
        .distinct()
        .select('id')
        .from('table')
        .getSQL();

    expect(sql).toBe('SELECT DISTINCT id FROM table');
});

test('subquery select', () => {
    const sql = (new QueryBuilder())
        .select('id', {
            something: (builder) => {
                builder
                    .select('name')
                    .from('table_two')
                    .where('id', 10);
            },
        })
        .from('table')
        .getSQL();

    expect(sql).toBe('SELECT id, (SELECT name FROM table_two WHERE id = 10) AS something FROM table');
});
