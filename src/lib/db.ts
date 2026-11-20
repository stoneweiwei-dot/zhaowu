export type SqlTag = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T[]>;

export async function getSql(): Promise<SqlTag> {
  const sql: SqlTag = async () => {
    throw new Error("Database not connected");
  };
  return sql;
}
