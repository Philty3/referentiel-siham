
DROP POLICY IF EXISTS "Allow public read" ON public.centres_couts;
DROP POLICY IF EXISTS "Allow public insert" ON public.centres_couts;
DROP POLICY IF EXISTS "Allow public update" ON public.centres_couts;
DROP POLICY IF EXISTS "Allow public delete" ON public.centres_couts;

CREATE POLICY "Allow anon read" ON public.centres_couts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert" ON public.centres_couts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update" ON public.centres_couts FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow anon delete" ON public.centres_couts FOR DELETE TO anon, authenticated USING (true);
