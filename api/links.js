import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all links for a user (userId as query param)
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ links: data });
  }
  if (req.method === 'POST') {
    // Create a new link
    const { userId, url, title, type, firstName, lastName } = req.body;
    if (!userId || !url) return res.status(400).json({ error: 'Missing userId or url' });
    const { data, error } = await supabase
      .from('links')
      .insert([{ userId, url, title, type, firstName, lastName }])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ link: data[0] });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
