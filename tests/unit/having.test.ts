import QueryBuilder from '../../src';

test('having', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .having('id', '>', 10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING id > 10');
});

test('having count', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingCount('id', '>', 10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING COUNT(id) > 10');
});

test('having count and', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingCount('id', '>', 10)
        .havingCount('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING COUNT(id) > 10 AND COUNT(id) < 100');
});

test('having count or', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingCount('id', '>', 10)
        .orHavingCount('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING COUNT(id) > 10 OR COUNT(id) < 100');
});

test('having sum', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingSum('id', '>', 10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING SUM(id) > 10');
});

test('having sum and', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingSum('id', '>', 10)
        .havingSum('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING SUM(id) > 10 AND SUM(id) < 100');
});

test('having sum or', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingSum('id', '>', 10)
        .orHavingSum('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING SUM(id) > 10 OR SUM(id) < 100');
});

test('having avg', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingAvg('id', '>', 10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING AVG(id) > 10');
});

test('having avg and', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingAvg('id', '>', 10)
        .havingAvg('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING AVG(id) > 10 AND AVG(id) < 100');
});

test('having avg or', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingAvg('id', '>', 10)
        .orHavingAvg('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING AVG(id) > 10 OR AVG(id) < 100');
});

test('having min', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingMin('id', '>', 10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING MIN(id) > 10');
});

test('having min and', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingMin('id', '>', 10)
        .havingMin('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING MIN(id) > 10 AND MIN(id) < 100');
});

test('having min or', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingMin('id', '>', 10)
        .orHavingMin('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING MIN(id) > 10 OR MIN(id) < 100');
});

test('having max', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingMax('id', '>', 10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING MAX(id) > 10');
});

test('having max and', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingMax('id', '>', 10)
        .havingMax('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING MAX(id) > 10 AND MAX(id) < 100');
});

test('having max or', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingMax('id', '>', 10)
        .orHavingMax('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING MAX(id) > 10 OR MAX(id) < 100');
});

test('having min and max', () => {
    const sql = (new QueryBuilder())
        .from('table')
        .groupBy('id')
        .havingMin('id', '>', 10)
        .havingMax('id', '<', 100)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table GROUP BY id HAVING MIN(id) > 10 AND MAX(id) < 100');
});
