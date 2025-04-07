import DB from '../../src';

test('select specific columns from table', () => {
    const sql = DB.table('table')
        .select('id', 'name', 'age')
        .getSQL();

    expect(sql).toBe('SELECT id, name, age FROM table');
});

test('select all columns from table', () => {
    const sql = DB.table('table').getSQL();

    expect(sql).toBe('SELECT * FROM table');
});

test('select raw statement', () => {
    const sql = DB.table('table')
        .selectRaw('SELECT column_one, column_two')
        .getSQL();

    expect(sql).toBe('SELECT column_one, column_two FROM table');
});


test('select column alias', () => {
    const sql = DB.table('table')
        .select({id: 'product_id'})
        .getSQL();

    expect(sql).toBe('SELECT id AS product_id FROM table');
});

test('select distinct', () => {
    const sql = DB.table('table')
        .distinct()
        .select('id')
        .getSQL();

    expect(sql).toBe('SELECT DISTINCT id FROM table');
});

test('subquery select', () => {
    const sql = DB.table('table')
        .select('id', {
            something: (builder) => {
                builder
                    .table('table_two')
                    .select('name')
                    .where('id', 10);
            },
        })
        .getSQL();

    expect(sql).toBe('SELECT id, (SELECT name FROM table_two WHERE id = 10) AS something FROM table');
});
