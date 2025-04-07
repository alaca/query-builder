import DB from '../../src';

test('select from', () => {
    const sql = DB.table('table').getSQL();

    expect(sql).toBe('SELECT * FROM table');
});

test('select from using alias', () => {
    const sql = DB.table('table', 't').getSQL();

    expect(sql).toBe('SELECT * FROM table AS t');
});


test('select from multiple tables', () => {
    const sql = DB.table('table_one').table('table_two').getSQL();

    expect(sql).toBe('SELECT * FROM table_one, table_two');
});
