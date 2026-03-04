-- Drop existing broken policies
DROP POLICY IF EXISTS "Allow public read" ON public.uo;
DROP POLICY IF EXISTS "Allow public insert" ON public.uo;
DROP POLICY IF EXISTS "Allow public update" ON public.uo;
DROP POLICY IF EXISTS "Allow public delete" ON public.uo;

-- Recreate with correct roles
CREATE POLICY "Allow anon read" ON public.uo FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert" ON public.uo FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update" ON public.uo FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow anon delete" ON public.uo FOR DELETE TO anon, authenticated USING (true);