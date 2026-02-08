-- Check the role of user 'eee'
SELECT 
  u.email,
  u.id,
  p.name,
  p.role,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'eee@example.com' OR u.email LIKE '%eee%';

-- Also check all profiles to see what users exist
SELECT 
  u.email,
  p.name,
  p.role,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
