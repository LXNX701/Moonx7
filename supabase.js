// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://xyadklogvxmzhoyxgmfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5YWRrbG9ndnhtemhveXhnbWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNTM3NTAsImV4cCI6MjA5NDcyOTc1MH0.rvllhbY6ktIDKGJNCTJqjkXhaYJV8q7mHEsflxrvOv0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ AUTENTICACIÓN ============
export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (!error && data.user) {
    await supabase.from('profiles').insert([{ id: data.user.id, email, name, role: 'customer' }]);
  }
  return { data, error };
}

export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase.from('profiles').select('role, name').eq('id', user.id).single();
  return { ...user, role: profile?.role || 'customer', name: profile?.name };
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// ============ PRODUCTOS ============
export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  const { data, error } = await supabase.from('products').insert([product]).select();
  if (error) throw error;
  return data[0];
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ============ CARRITO ============
export async function getCart(userId) {
  const { data, error } = await supabase.from('cart').select(`*, products(*)`).eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function addToCart(userId, productId, quantity = 1) {
  const { data: existing } = await supabase.from('cart').select('*').eq('user_id', userId).eq('product_id', productId).maybeSingle();
  if (existing) {
    const { data, error } = await supabase.from('cart').update({ quantity: existing.quantity + quantity }).eq('id', existing.id).select();
    if (error) throw error;
    return data[0];
  } else {
    const { data, error } = await supabase.from('cart').insert([{ user_id: userId, product_id: productId, quantity }]).select();
    if (error) throw error;
    return data[0];
  }
}

export async function updateCartItem(cartId, quantity) {
  const { data, error } = await supabase.from('cart').update({ quantity }).eq('id', cartId).select();
  if (error) throw error;
  return data[0];
}

export async function removeFromCart(cartId) {
  const { error } = await supabase.from('cart').delete().eq('id', cartId);
  if (error) throw error;
  return true;
}

// ============ PEDIDOS ============
export async function updateOrderStatus(orderId, status, licenseDelivered = null) {
  const updateData = { status };
  if (licenseDelivered) updateData.license_delivered = licenseDelivered;
  const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
  if (error) throw error;
  return true;
}

// ============ MÉTODOS DE PAGO ============
export async function getPaymentMethods() {
  const { data, error } = await supabase.from('payment_methods').select('*').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return data;
}

export async function getAllPaymentMethods() {
  const { data, error } = await supabase.from('payment_methods').select('*').order('sort_order');
  if (error) throw error;
  return data;
}

export async function createPaymentMethod(method) {
  const { data, error } = await supabase.from('payment_methods').insert([method]).select();
  if (error) throw error;
  return data[0];
}

export async function updatePaymentMethod(id, method) {
  const { data, error } = await supabase.from('payment_methods').update(method).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

export async function deletePaymentMethod(id) {
  const { error } = await supabase.from('payment_methods').delete().eq('id', id);
  if (error) throw error;
  return true;
}