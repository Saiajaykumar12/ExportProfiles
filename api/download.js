import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { linkId, userId } = req.query;
  if (!linkId || !userId) return res.status(400).send('Missing linkId or userId');
  const { data: link, error } = await supabase
    .from('links')
    .select('*')
    .eq('id', linkId)
    .eq('userId', userId)
    .single();
  if (error || !link) return res.status(404).send('Link not found');
  // Fetch user for email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();
  const csv = `SNO,LINK,FIRST NAME,LAST NAME,MAIL,TYPE,TIME,DATE\n1,${link.url},${link.firstName || ''},${link.lastName || ''},${user?.email || ''},${link.type || ''},${new Date(link.createdAt).toLocaleTimeString()},${new Date(link.createdAt).toLocaleDateString()}`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=profile_data_${linkId}.csv`);
  res.send(csv);
}
