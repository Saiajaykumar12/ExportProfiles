import { createClient } from '@supabase/supabase-js';

// Environment variables (set these in Vercel dashboard)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ user: data });
}
