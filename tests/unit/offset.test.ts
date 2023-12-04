import QueryBuilder from '../../src';

test('offset', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .limit(10)
        .offset(10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table LIMIT 10 OFFSET 10');
});
