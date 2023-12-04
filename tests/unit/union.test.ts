import QueryBuilder from '../../src';

test('union', () => {
    const builder1 = (new QueryBuilder())
        .select('something')
        .from('table');

    const sql = (new QueryBuilder())
        .select('something_else')
        .from('another_table')
        .union(builder1)
        .getSQL();

    expect(sql).toBe('SELECT something_else FROM another_table UNION SELECT something FROM table');
});

test('union all', () => {
    const builder1 = (new QueryBuilder())
        .select('something')
        .from('table');

    const builder2 = (new QueryBuilder())
        .select('another_thing')
        .from('another_table');

    const sql = (new QueryBuilder())
        .select('something_else')
        .from('some_table')
        .unionAll(builder1, builder2)
        .getSQL();

    expect(sql).toBe('SELECT something_else FROM some_table UNION ALL SELECT something FROM table UNION ALL SELECT another_thing FROM another_table');
});
