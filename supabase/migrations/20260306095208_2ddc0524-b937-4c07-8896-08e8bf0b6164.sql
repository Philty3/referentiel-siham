CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  item_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(table_name, item_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read" ON public.favorites FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert" ON public.favorites FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon delete" ON public.favorites FOR DELETE TO anon USING (true);