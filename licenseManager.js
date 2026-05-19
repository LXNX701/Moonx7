// js/licenseManager.js
import { supabase } from './supabase.js';

function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 5; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return `MX7-${segments.join('-')}`;
}

export async function createLicense(productId, userId, orderId) {
  const { data: product } = await supabase.from('products').select('duration_days, is_lifetime').eq('id', productId).single();
  const licenseKey = generateLicenseKey();
  const expiresAt = product?.is_lifetime ? null : new Date(Date.now() + ((product?.duration_days || 30) * 24 * 60 * 60 * 1000));
  
  const { data, error } = await supabase.from('licenses').insert([{
    license_key: licenseKey, product_id: productId, duration_days: product?.is_lifetime ? 0 : (product?.duration_days || 30),
    order_id: orderId, expires_at: expiresAt
  }]).select();
  if (error) throw error;
  return data[0];
}

export async function getUserLicenses(userId) {
  const { data, error } = await supabase.from('licenses').select(`*, products(*)`).eq('used_by', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}