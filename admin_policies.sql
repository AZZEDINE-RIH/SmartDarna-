-- Allow admins to update any seller
CREATE POLICY "Enable update for admins" ON public.sellers
FOR UPDATE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Allow admins to delete any seller
CREATE POLICY "Enable delete for admins" ON public.sellers
FOR DELETE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
