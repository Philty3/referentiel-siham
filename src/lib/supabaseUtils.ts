import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all rows from a Supabase table, bypassing the default 1000-row limit.
 * Uses pagination with range queries.
 */
export async function fetchAllRows(
  tableName: string,
  orderBy: string,
  pageSize = 1000
): Promise<{ data: any[]; error: any }> {
  let allRows: any[] = [];
  let from = 0;
  let hasMore = true;
  let lastError: any = null;

  while (hasMore) {
    const { data: rows, error } = await supabase
      .from(tableName as any)
      .select("*")
      .order(orderBy)
      .range(from, from + pageSize - 1);

    if (error) {
      lastError = error;
      break;
    }

    if (rows && rows.length > 0) {
      allRows = allRows.concat(rows);
      from += pageSize;
      if (rows.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return { data: allRows, error: lastError };
}
