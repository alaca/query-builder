import DB from '../../src';

test('union', () => {
    const builder1 = DB.table('table')
        .select('something');

    const sql = DB.table('another_table')
        .select('something_else')
        .union(builder1)
        .getSQL();

    expect(sql).toBe('SELECT something_else FROM another_table UNION SELECT something FROM table');
});

test('union all', () => {
    const builder1 = DB.table('table').select('something');
    const builder2 = DB.table('another_table').select('another_thing');

    const sql = DB.table('some_table')
        .select('something_else')
        .unionAll(builder1, builder2)
        .getSQL();

    expect(sql).toBe('SELECT something_else FROM some_table UNION ALL SELECT something FROM table UNION ALL SELECT another_thing FROM another_table');
});
