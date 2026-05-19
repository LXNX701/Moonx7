// CONFIGURACIÓN SUPABASE
const SUPA_URL = 'https://ivkikynruyhazugzasyg.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2lreW5ydXloYXp1Z3phc3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Nzg5MDgsImV4cCI6MjA5MDE1NDkwOH0.9xcBUZX0GX2uLA3-IXjmAWFQv5luR0z-Ui4o2PIfRFs';
const supa = supabase.createClient(SUPA_URL, SUPA_KEY);

let cart = [];

// CARGAR DATOS
async function init() {
    const { data } = await supa.from('products').select('*').order('created_at', {ascending: false});
    if (data) {
        renderShop(data);
        if(document.getElementById('adminList')) renderAdmin(data);
    }
    if(document.getElementById('loader')) document.getElementById('loader').style.display = 'none';
}

function renderShop(items) {
    const grid = document.getElementById('productsGrid');
    if(!grid) return;
    grid.innerHTML = items.map(p => `
        <div class="pcard">
            <img src="${p.image || 'https://via.placeholder.com/300x170'}">
            <div class="p-info">
                <h3>${p.name}</h3>
                <div class="p-price">$${p.price_1d} USD</div>
                <button class="btn-stellar" onclick="add('${p.name}', ${p.price_1d})">AGREGAR</button>
            </div>
        </div>
    `).join('');
}

// CARRITO
function add(n, p) {
    cart.push({n, p});
    updateUI();
    toggleCart(true);
}

function updateUI() {
    document.getElementById('CN').innerText = cart.length;
    const total = cart.reduce((a, b) => a + b.p, 0);
    document.getElementById('CT').innerText = `$${total.toFixed(2)} USD`;
    document.getElementById('cartItems').innerHTML = cart.map(i => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; background:rgba(255,255,255,0.05); padding:10px; border-radius:5px;">
            <span>${i.n}</span> <span>$${i.p}</span>
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
    if(!cart.length) return;
    let msg = "🌙 *PEDIDO MOONZAZA* 🌙\\n\\n";
    cart.forEach(i => msg += `🚀 ${i.n} - $${i.p}\\n`);
    msg += `\\n*TOTAL:* $${cart.reduce((a,b)=>a+b.p,0).toFixed(2)} USD`;
    window.open(`https://wa.me/543521402846?text=${encodeURIComponent(msg)}`, '_blank');
}

// ADMIN FUNCTIONS
async function saveProd() {
    const name = document.getElementById('pN').value;
    const price = document.getElementById('pP').value;
    const image = document.getElementById('pI').value;
    const { error } = await supa.from('products').insert([{ name, price_1d: price, image }]);
    if(!error) { alert("¡Desplegado en la órbita!"); location.reload(); }
}

function renderAdmin(items) {
    document.getElementById('adminList').innerHTML = items.map(p => `
        <div style="display:flex; justify-content:space-between; background:#111; padding:15px; margin-bottom:10px; border:1px solid #333; border-radius:10px;">
            <span>${p.name} ($${p.price_1d})</span>
            <button onclick="del(${p.id})" style="background:red; color:white; border:none; border-radius:5px; cursor:pointer;">BORRAR</button>
        </div>
    `).join('');
}

async function del(id) {
    if(confirm("¿Eliminar producto?")) {
        await supa.from('products').delete().eq('id', id);
        location.reload();
    }
}

document.addEventListener('DOMContentLoaded', init);
