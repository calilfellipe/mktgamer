/*
  # Fix Admin Permissions for califellipee@outlook.com

  1. Updates
    - Set role to 'admin' for califellipee@outlook.com
    - Set is_verified to true for admin user
    - Ensure admin has proper permissions

  2. Security
    - Only affects the specific admin email
    - Maintains existing user data
*/

-- Update admin permissions for califellipee@outlook.com
UPDATE users 
SET 
  role = 'admin',
  is_verified = true,
  updated_at = NOW()
WHERE email = 'califellipee@outlook.com';

-- Create admin user if doesn't exist
INSERT INTO users (
  id,
  username, 
  email, 
  role, 
  is_verified,
  avatar_url,
  balance,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'admin',
  'califellipee@outlook.com',
  'admin',
  true,
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
  0.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'califellipee@outlook.com'
);