-- Enable RLS on tables
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."course" ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'user' table
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public."user"
FOR SELECT
USING (auth.uid()::text = id::text); -- Assuming 'id' is linked to auth.uid via some mechanism, or if using custom auth, this needs adjustment. 
-- Note: If using Supabase Auth, usually you link public.user.id to auth.users.id. 
-- If this is a custom 'user' table not linked to Supabase Auth, RLS is tricky without a custom claim or using the service_role for the backend.
-- Assuming the backend uses the service_role key to access the DB, it bypasses RLS by default.
-- So we mainly need to protect against anon/public access.

-- Allow public registration (insert)
CREATE POLICY "Public can register" ON public."user"
FOR INSERT
WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public."user"
FOR UPDATE
USING (auth.uid()::text = id::text);

-- 2. Policies for 'course' table
-- Allow everyone (anon and authenticated) to view courses
CREATE POLICY "Public can view courses" ON public."course"
FOR SELECT
USING (true);

-- Restrict modifications to service_role only (implicit if no policy allows it for anon/authenticated)
-- No INSERT/UPDATE/DELETE policy for anon/authenticated implies "Deny All" for them.

-- 3. Policies for 'order' table
-- Allow users to view their own orders
CREATE POLICY "Users can view own orders" ON public."order"
FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Allow authenticated users to create orders
CREATE POLICY "Users can create orders" ON public."order"
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- GRANT usage on schema public to anon and authenticated (often default, but good to ensure)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON public."course" TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public."user" TO anon, authenticated;
GRANT SELECT, INSERT ON public."order" TO authenticated;
