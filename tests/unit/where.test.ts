import DB from '../../src';

test('where', () => {
    const sql = DB.table('table')
        .where('id', 10)
        .getSQL();

    expect(sql).toBe('SELECT * FROM table WHERE id = 10');
});

test('where and where', () => {
    const sql = DB.table('table')
        .where('id', 10)
        .where('status', 'published')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE id = 10 AND status = 'published'");
});

test('where or where', () => {
    const sql = DB.table('table')
        .where('status', 'published')
        .orWhere('status', 'completed')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE status = 'published' OR status = 'completed'");
});

test('where like', () => {
    const sql = DB.table('table')
        .whereLike('status', 'something')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE status LIKE '%something%'");
});

test('where like left wild card', () => {
    const sql = DB.table('table')
        .whereLike('status', '%something')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE status LIKE '%something'");
});

test('where like right wild card', () => {
    const sql = DB.table('table')
        .whereLike('status', 'something%')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE status LIKE 'something%'");
});

test('where like or like', () => {
    const sql = DB.table('table')
        .whereLike('status', 'something')
        .orWhereLike('status', 'some other thing')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE status LIKE '%something%' OR status LIKE '%some other thing%'");
});

test('where not like', () => {
    const sql = DB.table('table')
        .whereNotLike('status', 'something')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE status NOT LIKE '%something%'");
});

test('where not like or not like', () => {
    const sql = DB.table('table')
        .whereNotLike('status', 'something')
        .orWhereNotLike('status', 'some other thing')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE status NOT LIKE '%something%' OR status NOT LIKE '%some other thing%'");
});

test('where between', () => {
    const sql = DB.table('table')
        .whereBetween('id', 10, 100)
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE id BETWEEN 10 AND 100");
});

test('where between or between', () => {
    const sql = DB.table('table')
        .whereBetween('id', 10, 100)
        .orWhereBetween('id', 200, 300)
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE id BETWEEN 10 AND 100 OR id BETWEEN 200 AND 300");
});

test('where not between', () => {
    const sql = DB.table('table')
        .whereNotBetween('id', 10, 100)
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE id NOT BETWEEN 10 AND 100");
});

test('where in', () => {
    const sql = DB.table('table')
        .whereIn('id', [10, 100])
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE id IN (10,100)");
});

test('where in string', () => {
    const sql = DB.table('table')
        .whereIn('status', ['open', 'closed'])
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE status IN ('open','closed')");
});

test('where raw', () => {
    const sql = DB.table('table')
        .whereRaw('WHERE something = %d and something_else = %s', 10, 'something')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE something = 10 and something_else = 'something'");
});

test('where is null', () => {
    const sql = DB.table('table')
        .whereIsNull('id')
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE id IS NULL");
});

test('where nested clause', () => {
    const sql = DB.table('table')
        .where('status', 'published')
        .orWhere(qb => {
            qb
                .where('status', 'draft')
                .where('writing', 'locked');
        })
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE status = 'published' OR (status = 'draft' AND writing = 'locked')");
});


test('where subquery', () => {
    const sql = DB.table('table')
        .whereIn('id', qb => {
            qb
                .table('another_table')
                .select('another_id')
                .where('category', 'something');
        })
        .getSQL();

    expect(sql).toBe("SELECT * FROM table WHERE id IN (SELECT another_id FROM another_table WHERE category = 'something')");
});
