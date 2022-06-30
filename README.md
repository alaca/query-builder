# Query Builder

- [Select](#select)

- [From](#from)

- [Joins](#joins)
    - [LEFT Join](#left-join)
    - [RIGHT Join](#right-join)
    - [INNER Join](#inner-join)
    - [Join Raw](#join-raw)
    - [Advanced Join](#advanced-join)

- [Where Clauses](#where-clauses)
    - [Where](#where)
    - [Where IN](#where-in)
    - [Where BETWEEN](#where-between)
    - [Where LIKE](#where-like-clauses)
    - [Where IS NULL](#where-is-null)
    - [Where Subquery](#where-subquery)
    - [Where Nested](#where-nested)

- [Ordering, Grouping, Limit & Offset](#ordering-grouping-limit--offset)
    - [Ordering](#ordering)
    - [Grouping](#grouping)
    - [Limit & Offset](#limit--offset)

## Select

#### Available methods - select / selectRaw / distinct

```ts
const sql = (new QueryBuilder())
  .select('id', 'name', 'age')
  .from('table')
  .getSQL();
```

Generated SQL

```sql
SELECT id, name, age
FROM table
```

**Column alias**

```ts
const sql = (new QueryBuilder())
  .select({
    id: 'product_id',
    title: 'product_title'
  })
  .from('table')
  .getSQL();
```

Generated SQL:

```sql
SELECT id AS product_id, title AS product_title
FROM table
```

**Distinct**

```ts
const sql = (new QueryBuilder())
  .distinct()
  .select('category')
  .from('table')
  .getSQL();
```

Generated SQL:

```sql
SELECT DISTINCT category
FROM table
```

**selectRaw**

```ts
const sql = (new QueryBuilder())
  .selectRaw('SELECT one, two, three')
  .from('table')
  .getSQL();
```

Generated SQL

```sql
SELECT one, two, three
FROM table
```

**By default, all columns will be selected from table.**

```ts
const sql = (new QueryBuilder())
  .from('table')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
```

## From

```ts
const sql = (new QueryBuilder())
  .from('table')
  .getSQL();
```

Set multiple `FROM`

```ts
const sql = (new QueryBuilder())
  .from('table')
  .from('another_table')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table,
     another_table
```

## Joins

#### Available methods - leftJoin / rightJoin / innerJoin / joinRaw / join

### LEFT Join

```ts
const sql = (new QueryBuilder())
  .from('table')
  .leftJoin('another_table', 'id', 'another_id')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
         LEFT JOIN another_table ON id = another_id
```

### RIGHT Join

```ts
const sql = (new QueryBuilder())
  .from('table')
  .rightJoin('another_table', 'id', 'another_id')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
         RIGHT JOIN another_table ON id = another_id
```

### INNER Join

```ts
const sql = (new QueryBuilder())
  .from('table')
  .innerJoin('another_table', 'id', 'another_id')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
         INNER JOIN another_table ON id = another_id
```

### Join Raw

```ts
const sql = (new QueryBuilder())
  .from('table')
  .joinRaw('LEFT JOIN another_table t ON id = another_id')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
         LEFT JOIN another_table t ON id = another_id
```

### Advanced Join

```ts
  const sql = (new QueryBuilder())
  .from('table')
  .join(qb => {
    qb
      .leftJoin('another_table')
      .on('id', 'another_id')
      .and('other_column', 'something')
      .or('other_column', 'other_thing')
  })
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
         LEFT JOIN another_table ON id = another_id AND other_column = 'something' OR other_column = 'other_thing'
```

## Where Clauses

### Where

#### Available methods - where / orWhere

```ts
const sql = (new QueryBuilder())
  .where('id', 10)
  .from('table')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
WHERE id = 10
```

Set multiple `WHERE`

```ts
const sql = (new QueryBuilder())
  .where('id', 10)
  .where('status', 'published')
  .from('table')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
WHERE id = 10
  AND status = 'published'
```

### Where IN

#### Available methods - whereIn / orWhereIn / whereNotIn / orWhereNotIn

```ts
const sql = (new QueryBuilder())
  .from('table')
  .whereIn('id', [10, 100])
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
WHERE id IN (10, 100)
```

### Where BETWEEN

#### Available methods - whereBetween / orWhereBetween / whereNotBetween / orWhereNotBetween

```ts
const sql = (new QueryBuilder())
  .from('table')
  .whereBetween('id', 10, 100)
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
WHERE id BETWEEN 10 AND 100
```

### Where LIKE Clauses

#### Available methods - whereLike / orWhereLike / whereNotLike / orWhereNotLike

```ts
const sql = (new QueryBuilder())
  .from('table')
  .whereLike('status', 'something')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
WHERE status LIKE '%something%'
```

### Where IS NULL

#### Available methods - whereIsNull / orWhereIsNull / whereIsNotNull / orWhereIsNotNull

```ts
const sql = (new QueryBuilder())
  .from('table')
  .whereIsNull('id')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
WHERE id IS NULL
```

### Where Subquery

```ts
const sql = (new QueryBuilder())
  .from('table')
  .whereIn('id', qb => {
    qb
      .select('another_id')
      .from('another_table')
      .where('category', 'something')
  })
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
WHERE id IN (SELECT another_id FROM another_table WHERE category = 'something')
```

### Where Nested

```ts
const sql = (new QueryBuilder())
  .from('table')
  .where('status', 'published')
  .orWhere(qb => {
    qb
      .where('status', 'draft')
      .where('writing', 'locked')
  })
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
WHERE status = 'published'
   OR (status = 'draft' AND writing = 'locked')
```

## Ordering, Grouping, Limit & Offset

### Ordering

```ts
const sql = (new QueryBuilder())
  .from('table')
  .orderBy('id')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
ORDER BY id ASC
```

Order by multiple columns

```ts
const sql = (new QueryBuilder())
  .from('table')
  .orderBy('id')
  .orderBy('column_one', 'DESC')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
ORDER BY id ASC, column_one DESC
```

### Grouping

#### Available methods - groupBy / having / orHaving / havingCount / orHavingCount / havingMin / orHavingMin / havingMax / orHavingMax / havingAvg / orHavingAvg / havingSum / orHavingSum / havingRaw

```ts
const sql = (new QueryBuilder())
  .from('table')
  .groupBy('id')
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
GROUP BY id
```

**Having**

```ts
const sql = (new QueryBuilder())
  .from('table')
  .groupBy('id')
  .having('id', '>', 10)
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
GROUP BY id
HAVING id > 10
```

### Limit & Offset

#### Available methods - limit / offset

**Limit**

```ts
const sql = (new QueryBuilder())
  .from('table')
  .limit(10)
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
LIMIT 10
```

**Offset**

```ts
const sql = (new QueryBuilder())
  .from('table')
  .limit(10)
  .offset(10)
  .getSQL();
```

Generated SQL

```sql
SELECT *
FROM table
LIMIT 10 OFFSET 10
```
