import DB from '../../src';

test('order by column asc', () => {
    const sql = DB.table('table')
        .orderBy('id')
        .getSQL();

    expect(sql).toBe('SELECT * FROM table ORDER BY id ASC');
});

test('order by column desc', () => {
    const sql = DB.table('table')
        .orderBy('id', 'DESC')
        .getSQL();

    expect(sql).toBe('SELECT * FROM table ORDER BY id DESC');
});

test('order by multiple columns', () => {
    const sql = DB.table('table')
        .orderBy('id')
        .orderBy('column_one', 'DESC')
        .getSQL();

    expect(sql).toBe('SELECT * FROM table ORDER BY id ASC, column_one DESC');
});
