import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.warn('⚠️ Missing Supabase configuration. Please add SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to .env');
}

// Service role client (for admin operations)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper functions for database operations
export const db = {
  // Get single row
  async get(table, conditions = {}) {
    let query = supabase.from(table).select('*');
    
    for (const [key, value] of Object.entries(conditions)) {
      query = query.eq(key, value);
    }
    
    const { data, error } = await query.limit(1);
    if (error) throw error;
    return data?.[0] || null;
  },

  // Get multiple rows
  async query(table, conditions = {}, options = {}) {
    let q = supabase.from(table).select('*');
    
    for (const [key, value] of Object.entries(conditions)) {
      q = q.eq(key, value);
    }

    // Add ordering
    if (options.orderBy) {
      const { column, ascending = false } = options.orderBy;
      q = q.order(column, { ascending });
    }

    // Add limit
    if (options.limit) {
      q = q.limit(options.limit);
    }

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  // Count rows
  async count(table, conditions = {}) {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    
    for (const [key, value] of Object.entries(conditions)) {
      q = q.eq(key, value);
    }

    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  },

  // Insert row
  async insert(table, data) {
    const { data: result, error } = await supabase.from(table).insert([data]).select();
    if (error) throw error;
    return result?.[0] || null;
  },

  // Update row
  async update(table, data, conditions) {
    let q = supabase.from(table).update(data);
    
    for (const [key, value] of Object.entries(conditions)) {
      q = q.eq(key, value);
    }

    const { data: result, error } = await q.select();
    if (error) throw error;
    return result?.[0] || null;
  },

  // Delete row
  async delete(table, conditions) {
    let q = supabase.from(table).delete();
    
    for (const [key, value] of Object.entries(conditions)) {
      q = q.eq(key, value);
    }

    const { error } = await q;
    if (error) throw error;
  },

  // Raw SQL for complex queries
  async rpc(functionName, params) {
    const { data, error } = await supabase.rpc(functionName, params);
    if (error) throw error;
    return data;
  }
};

export default supabase;
