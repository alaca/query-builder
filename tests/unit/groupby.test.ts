import DB from '../../src';

test('group by column', () => {
    const sql = DB.table('table')
        .groupBy('id')
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id');
});


test('group by multiple columns', () => {
    const sql = DB.table('table')
        .groupBy('id')
        .groupBy('column_one')
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id, column_one');
});
