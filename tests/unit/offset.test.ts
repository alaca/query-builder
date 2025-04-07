import DB from '../../src';

test('offset', () => {
    const sql = DB.table('table')
        .limit(10)
        .offset(10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table LIMIT 10 OFFSET 10');
});
