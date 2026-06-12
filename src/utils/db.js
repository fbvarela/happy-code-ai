import { neon } from "@neondatabase/serverless";

let _sql;
function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    _sql = neon(url);
  }
  return _sql;
}

// Proxy so `sql`...`` tagged-template calls and `sql.query(...)` both work.
const sql = new Proxy(function () {}, {
  apply(_, __, args) {
    return getSql()(...args);
  },
  get(_, prop) {
    return getSql()[prop];
  },
});

export default sql;
