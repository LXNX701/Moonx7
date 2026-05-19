// --- CONFIGURACIÓN (REEMPLAZA CON TUS LLAVES) ---
const SUPA_URL = 'https://ivkikynruyhazugzasyg.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2lreW5ydXloYXp1Z3phc3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg5MDgsImV4cCI6MjA5MDE1NDkwOH0.9xcBUZX0GX2uLA3-IXjmAWFQv5luR0z-Ui4o2PIfRFs';
const supa = supabase.createClient(SUPA_URL, SUPA_KEY);

const ADMIN_USER = "admin";
const ADMIN_PASS = "moon77"; // Tu contraseña

let cart = [];

// --- SEGURIDAD Y LOGS ---
async function login() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;

    if (u === ADMIN_USER && p === ADMIN_PASS) {
        // Registrar en Supabase
        await supa.from('admin_logs').insert([{ usuario: u, evento: "Acceso Exitoso" }]);
        localStorage.setItem('moon_auth', 'true');
        checkAuth();
    } else {
        await supa.from('admin_logs').insert([{ usuario: u, evento: "Fallo de Login: " + u }]);
        alert("Credenciales incorrectas");
    }
}

function checkAuth() {
    const auth = localStorage.getItem('moon_auth');
    if (auth === 'true' && document.getElementById('adminPanel')) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadLogs();
    }
}

function logout() {
    localStorage.removeItem('moon_auth');
    location.reload();
}

// --- GESTIÓN DE PRODUCTOS ---
async function loadData() {
    const { data } = await supa.from('products').select('*').order('created_at', {ascending: false});
    if (data) {
        renderShop(data);
        if (document.getElementById('adminList')) renderAdmin(data);
    }
}

function renderShop(items) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = items.map(p => `
        <div class="pcard">
            <img src="${p.image}">
            <h4>${p.name}</h4>
            <div class="p-price">$${p.price_1d} USD</div>
            <button class="btn-main" onclick="addToCart('${p.name}', ${p.price_1d})">Añadir</button>
        </div>
    `).join('');
}

// Carrito
function addToCart(name, price) {
    cart.push({ name, price });
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    document.getElementById('CN').innerText = cart.length;
    const total = cart.reduce((a, b) => a + b.price, 0);
    document.getElementById('CT').innerText = `$${total.toFixed(2)}`;
    document.getElementById('cartItems').innerHTML = cart.map(i => `
        <div style="display:flex; justify-content:space-between; background:#1c1c1e; padding:12px; border-radius:12px; margin-bottom:10px">
            <span>${i.name}</span> <strong>$${i.price}</strong>
        </div>
    `).join('');
}

function toggleCart(open) {
    const s = document.getElementById('cartSidebar');
    const o = document.getElementById('cartOverlay');
    if(open) { s.classList.add('active'); o.classList.add('active'); }
    else { s.classList.remove('active'); o.classList.remove('active'); }
}

function checkout() {
    let msg = "✨ *PEDIDO MOONZAZA STORE* ✨\\n\\n";
    cart.forEach(i => msg += `• ${i.name} ($${i.price})\\n`);
    msg += `\\n*TOTAL:* $${cart.reduce((a,b)=>a+b.price,0).toFixed(2)} USD`;
    window.open(`https://wa.me/543521402846?text=${encodeURIComponent(msg)}`, '_blank');
}

// Logs en Admin
async function loadLogs() {
    const { data } = await supa.from('admin_logs').select('*').order('fecha', {ascending: false}).limit(10);
    if (data) {
        document.getElementById('logsList').innerHTML = data.map(l => `
            <div>[${new Date(l.fecha).toLocaleTimeString()}] ${l.usuario}: ${l.evento}</div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    checkAuth();
});
