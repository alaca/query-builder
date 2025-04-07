import DB from '../../src';

test('limit', () => {
    const sql = DB.table('table')
        .limit(10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table LIMIT 10');
});
