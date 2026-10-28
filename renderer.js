const defaultData = {
  orders: [
    { id: 'LD-1004', customer: 'Amelia Johnson', phone: '555-0182', delivery: '2026-10-28', items: [{ name: 'Shirt', qty: 3, price: 5 }], payment: 'Card', discount: 0, status: 'Ready' },
    { id: 'LD-1003', customer: 'Noah Williams', phone: '555-0144', delivery: '2026-10-29', items: [{ name: 'Suit', qty: 1, price: 18 }, { name: 'Trousers', qty: 2, price: 8 }], payment: 'Cash', discount: 5, status: 'In progress' },
    { id: 'LD-1002', customer: 'Sophia Brown', phone: '555-0118', delivery: '2026-10-30', items: [{ name: 'Dress', qty: 1, price: 15 }], payment: 'Mobile money', discount: 0, status: 'Pending' }
  ],
  employees: [{ name: 'Maria Santos', email: 'employee@laundry.local', role: 'Employee' }],
  prices: { Shirt: 5, Trousers: 8, Dress: 15, Suit: 18, 'Bed sheet': 12, Jacket: 10 },
  inventory: { Shirt: 0, Trousers: 0, Dress: 0, Suit: 0, 'Bed sheet': 0, Jacket: 0 },
  defaultDiscount: 0
};
const users = {
  admin: { password: 'admin123', name: 'Administrator', role: 'Administrator' },
  'employee@laundry.local': { password: 'employee123', name: 'Laundry Employee', role: 'Employee' }
};
let data = JSON.parse(localStorage.getItem('laundryDeskData') || JSON.stringify(defaultData));
data.inventory = data.inventory || {};
data.defaultDiscount = Number(data.defaultDiscount) || 0;
function syncEmployeeUsers() {
  data.employees.forEach(employee => {
    const username = (employee.username || employee.email || '').trim().toLowerCase();
    if (username) users[username] = { email: username, password: employee.password || 'employee123', name: employee.name, role: employee.role, username, contactEmail: employee.email || '', active: employee.active !== false, expiresAt: employee.expiresAt || '' };
  });
}
syncEmployeeUsers();
let currentUser = null;
const money = value => `GH₵${Number(value).toFixed(2)}`;
const save = () => {
  localStorage.setItem('laundryDeskData', JSON.stringify(data));
  fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ users, ...data }) })
    .catch(() => showToast('Database connection unavailable'));
};
fetch('/api/state').then(response => response.ok ? response.json() : Promise.reject(new Error('Database unavailable'))).then(state => {
  data = state;
  data.defaultDiscount = Number(state.defaultDiscount) || 0;
  Object.keys(users).forEach(email => delete users[email]);
  Object.assign(users, state.users);
  syncEmployeeUsers();
  localStorage.setItem('laundryDeskData', JSON.stringify(data));
  restoreSession();
}).catch(() => {
  showToast('Using local data until the database reconnects');
  restoreSession();
});
const today = () => new Date().toISOString().slice(0, 10);
const total = order => order.items.reduce((sum, item) => sum + item.qty * item.price, 0) * (1 - (order.discount || 0) / 100);
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const statusClass = status => status === 'Ready' ? 'ready' : status === 'In progress' ? 'progress' : 'pending';

function openUserSession(loginId, user) {
  currentUser = { ...user, email: loginId };
  localStorage.setItem('laundryDeskSession', loginId);
  document.querySelector('#login-screen').classList.add('hidden');
  document.querySelector('#app-shell').classList.remove('hidden');
  document.querySelector('#user-name').textContent = user.name;
  document.querySelector('#user-role').textContent = user.role;
  document.querySelector('#user-avatar').textContent = user.name[0];
  document.querySelectorAll('.admin-only').forEach(element => element.classList.toggle('hidden', user.role !== 'Administrator'));
  document.querySelectorAll('.employee-only').forEach(element => element.classList.toggle('hidden', user.role !== 'Employee'));
  showView('dashboard');
}
function restoreSession() {
  const loginId = localStorage.getItem('laundryDeskSession');
  const user = loginId ? users[loginId] : null;
  if (user) openUserSession(loginId, user);
}
document.querySelector('#login-form').addEventListener('submit', event => {
  event.preventDefault();
  const loginId = document.querySelector('#login-email').value.trim().toLowerCase();
  const user = users[loginId];
  if (user && user.role === 'Employee' && (!user.active || (user.expiresAt && user.expiresAt < today()))) {
    document.querySelector('#login-error').textContent = user.expiresAt && user.expiresAt < today() ? 'This employee account has expired.' : 'This employee account is disabled.';
    return;
  }
  if (!user || user.password !== document.querySelector('#login-password').value) {
    document.querySelector('#login-error').textContent = 'Incorrect username or password.';
    return;
  }
  openUserSession(loginId, user);
});
document.querySelector('#logout-button').addEventListener('click', () => {
  localStorage.removeItem('laundryDeskSession');
  location.reload();
});
document.querySelector('#password-button').addEventListener('click', () => showView('password'));
document.querySelector('#login-email').value = '';
document.querySelector('#login-password').value = '';
document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelector('#today-label').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

function showView(view) {
  document.querySelectorAll('.view').forEach(element => element.classList.add('hidden'));
  document.querySelector(`#view-${view}`).classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  document.querySelector('#page-title').textContent = { dashboard: 'Dashboard', orders: 'Orders', 'new-order': 'New order', password: 'Reset password', employees: 'Employees', settings: 'Settings' }[view];
  ({ dashboard: renderDashboard, orders: renderOrders, 'new-order': renderNewOrder, password: renderPassword, employees: renderEmployees, inventory: renderInventory, reports: renderReports, settings: renderSettings }[view])();
}
function renderDashboard() {
  const revenue = data.orders.reduce((sum, order) => sum + total(order), 0);
  const pending = data.orders.filter(order => order.status === 'Pending').length;
  const ready = data.orders.filter(order => order.status === 'Ready').length;
  document.querySelector('#view-dashboard').innerHTML = `
    <div class="grid stats-grid">
      <div class="card stat-card"><p>Total orders</p><strong>${data.orders.length}</strong></div>
      <div class="card stat-card"><p>Total revenue</p><strong class="accent">${money(revenue)}</strong></div>
      <div class="card stat-card"><p>Pending orders</p><strong>${pending}</strong></div>
      <div class="card stat-card"><p>Ready for pickup</p><strong>${ready}</strong></div>
    </div>
    <div class="grid dashboard-grid">
      <div class="card"><div class="card-header"><h3>Recent orders</h3><button class="secondary-button" data-action="orders">View all</button></div>${ordersTable(data.orders.slice(0, 5), false)}</div>
      <div class="card"><div class="card-header"><h3>Upcoming deliveries</h3></div>${data.orders.slice().sort((a,b) => a.delivery.localeCompare(b.delivery)).slice(0, 5).map(order => `<div class="delivery-row"><strong>${esc(order.customer)}</strong><small>${order.delivery} · ${esc(order.id)}</small></div>`).join('') || '<p class="empty">No upcoming deliveries.</p>'}</div>
    </div>`;
  document.querySelector('[data-action="orders"]')?.addEventListener('click', () => showView('orders'));
}
function ordersTable(orders, actions = true) {
  if (!orders.length) return '<p class="empty">No orders found.</p>';
  return `<table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Delivery</th><th>Total to pay</th><th>Status</th>${actions ? '<th>Actions</th>' : ''}</tr></thead><tbody>${orders.map(order => `<tr><td><strong>${esc(order.id)}</strong></td><td>${esc(order.customer)}<br><small>${esc(order.phone)}</small></td><td><div class="order-items"><div class="order-item-head"><span>Item</span><span>Quantity</span><span>Price</span></div>${order.items.map(item => `<div class="order-item"><strong>${esc(item.name)}</strong><span>${item.qty}</span><span>${money(item.price)}</span></div>`).join('')}</div></td><td>${order.delivery}</td><td><strong>${money(total(order))}</strong></td><td><span class="status ${statusClass(order.status)}">${esc(order.status)}</span></td>${actions ? `<td><button class="invoice-button" data-id="${order.id}" ${order.status !== 'Ready' ? 'disabled title="Invoice can be printed when the order is Ready"' : ''}>${order.status === 'Ready' ? 'Print invoice' : 'Not ready'}</button><select class="status-select" data-id="${order.id}"><option ${order.status === 'Pending' ? 'selected' : ''}>Pending</option><option ${order.status === 'In progress' ? 'selected' : ''}>In progress</option><option ${order.status === 'Ready' ? 'selected' : ''}>Ready</option></select></td>` : ''}</tr>`).join('')}</tbody></table>`;
}
function renderOrders() {
  document.querySelector('#view-orders').innerHTML = `<div class="card table-card"><div class="toolbar"><input id="order-search" placeholder="Search customer or order ID"><button class="primary-button" id="new-order-button">＋ New order</button></div><div id="orders-table">${ordersTable(data.orders)}</div></div>`;
  document.querySelector('#new-order-button').addEventListener('click', () => showView('new-order'));
  document.querySelector('#order-search').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    document.querySelector('#orders-table').innerHTML = ordersTable(data.orders.filter(order => `${order.id} ${order.customer} ${order.phone}`.toLowerCase().includes(query)));
    bindStatusChanges();
    bindInvoiceButtons();
  });
  bindStatusChanges();
  bindInvoiceButtons();
}
function bindStatusChanges() {
  document.querySelectorAll('.status-select').forEach(select => select.addEventListener('change', event => {
    data.orders.find(order => order.id === event.target.dataset.id).status = event.target.value;
    save(); showToast('Order status updated'); renderOrders();
  }));
}
function bindInvoiceButtons() {
  document.querySelectorAll('.invoice-button').forEach(button => button.addEventListener('click', () => printInvoice(button.dataset.id)));
}
function printInvoice(orderId) {
  const order = data.orders.find(item => item.id === orderId);
  if (!order) { showToast('Invoice order not found'); return; }
  if (order.status !== 'Ready') { showToast('Invoice can only be printed when the order is Ready'); return; }
  const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discountAmount = subtotal * ((order.discount || 0) / 100);
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) { showToast('Please allow pop-ups to print the invoice'); return; }
  printWindow.document.write(`<!doctype html><html><head><title>Invoice ${esc(order.id)}</title><style>
    body{font:14px Arial,sans-serif;color:#17243d;margin:0;padding:40px}main{max-width:760px;margin:auto}.header{display:flex;justify-content:space-between;border-bottom:3px solid #3867f2;padding-bottom:24px}.brand{font-size:30px;font-weight:800;font-style:italic}.invoice-title{text-align:right}.invoice-title h1{margin:0;color:#3867f2;font-size:28px}.muted{color:#778198}.details{display:grid;grid-template-columns:1fr 1fr;gap:25px;margin:28px 0}.details p{line-height:1.6;margin:0}table{width:100%;border-collapse:collapse;margin:22px 0}th,td{text-align:left;padding:13px 10px;border-bottom:1px solid #e6eaf2}th{color:#778198;font-size:11px;text-transform:uppercase}td:last-child,th:last-child{text-align:right}.summary{margin-left:auto;width:300px}.summary div{display:flex;justify-content:space-between;padding:8px 0}.summary .total{border-top:2px solid #17243d;font-size:20px;font-weight:800;margin-top:8px;padding-top:14px}.footer{margin-top:50px;text-align:center;color:#778198}@media print{body{padding:0}}
  </style></head><body><main><div class="header"><div class="brand">MK Laundry Service</div><div class="invoice-title"><h1>INVOICE</h1><div class="muted">${esc(order.id)}</div></div></div><div class="details"><p><strong>Bill to</strong><br>${esc(order.customer)}<br>${esc(order.phone)}</p><p><strong>Order details</strong><br>Delivery date: ${esc(order.delivery)}<br>Payment method: ${esc(order.payment)}<br>Status: ${esc(order.status)}</p></div><table><thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Amount</th></tr></thead><tbody>${order.items.map(item => `<tr><td>${esc(item.name)}</td><td>${item.qty}</td><td>${money(item.price)}</td><td>${money(item.qty * item.price)}</td></tr>`).join('')}</tbody></table><div class="summary"><div><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div><span>Discount (${order.discount || 0}%)</span><strong>- ${money(discountAmount)}</strong></div><div class="total"><span>Amount to be paid</span><strong>${money(total(order))}</strong></div></div><div class="footer">Thank you for choosing MK Laundry Service.</div></main></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => { printWindow.print(); };
}
function renderNewOrder() {
  const options = `<option value="" selected disabled>Select an item</option>${Object.keys(data.prices).map(item => `<option value="${esc(item)}">${esc(item)}</option>`).join('')}`;
  const canDiscount = currentUser.role === 'Administrator';
  const discountField = canDiscount
    ? `<label>Discount (%) <input name="discount" type="number" min="0" max="100" value="${data.defaultDiscount || 0}"></label>`
    : '<div class="discount-restricted"><strong>Discount</strong><span>Administrator approval required</span></div>';
  document.querySelector('#view-new-order').innerHTML = `<div class="card form-card"><div class="card-header"><div><h3>Create new order</h3><p class="muted">Record customer details, items, payment, and delivery.</p></div></div><form id="order-form"><div class="form-grid"><label>Customer name <input name="customer" required></label><label>Phone number <input name="phone" type="tel" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" minlength="10" required title="Phone number must contain exactly 10 digits"></label><label>Delivery date <input name="delivery" type="date" min="${today()}" value="${today()}" required></label><label>Payment method <select name="payment"><option>Cash</option><option>Mobile money</option></select></label><div class="wide"><label>Items</label><div class="item-head"><span>Item</span><span>Quantity</span><span>Price</span><span></span></div><div id="items-list" class="items-list"></div><button type="button" class="secondary-button" id="add-item">＋ Add item</button></div>${discountField}</div><div class="amount-due"><span>Amount to be paid</span><strong id="new-order-total">GH₵0.00</strong></div><div class="form-actions"><button type="button" class="secondary-button" id="cancel-order">Cancel</button><button class="primary-button" type="submit">Save order</button></div></form></div>`;
  const updateAmountDue = () => { const subtotal = [...document.querySelectorAll('.item-row')].reduce((sum, row) => sum + Number(row.querySelector('.item-qty').value || 0) * Number(row.querySelector('.item-price').value || 0), 0); const discount = canDiscount ? Number(document.querySelector('[name="discount"]').value || 0) : 0; document.querySelector('#new-order-total').textContent = money(subtotal * (1 - discount / 100)); };
  const addItem = () => { const row = document.createElement('div'); row.className = 'item-row'; row.innerHTML = `<select class="item-name" required>${options}</select><input class="item-qty" type="number" min="1" value="1"><input class="item-price" type="number" min="0" step=".01" value="0"><button type="button" class="remove-item">×</button>`; row.querySelector('.item-name').addEventListener('change', event => { row.querySelector('.item-price').value = data.prices[event.target.value] || 0; updateAmountDue(); }); row.querySelectorAll('input').forEach(input => input.addEventListener('input', updateAmountDue)); row.querySelector('.remove-item').addEventListener('click', () => { row.remove(); updateAmountDue(); }); document.querySelector('#items-list').appendChild(row); updateAmountDue(); };
  addItem(); if (canDiscount) document.querySelector('[name="discount"]').addEventListener('input', updateAmountDue); document.querySelector('#add-item').addEventListener('click', addItem); document.querySelector('#cancel-order').addEventListener('click', () => showView('dashboard'));
  document.querySelector('#order-form').addEventListener('submit', event => { event.preventDefault(); if (!event.target.reportValidity()) return; const form = new FormData(event.target); const items = [...document.querySelectorAll('.item-row')].map(row => ({ name: row.querySelector('.item-name').value, qty: Number(row.querySelector('.item-qty').value), price: Number(row.querySelector('.item-price').value) })); if (!items.length || items.some(item => !item.name)) return showToast('Select an item before saving the order'); data.orders.unshift({ id: `LD-${1000 + data.orders.length + 1}`, customer: form.get('customer'), phone: form.get('phone'), delivery: form.get('delivery'), payment: form.get('payment'), discount: canDiscount ? Number(form.get('discount')) || 0 : 0, items, status: 'Pending' }); save(); showToast('Order created successfully'); showView('orders'); });
}
function renderEmployees() {
  document.querySelector('#view-employees').innerHTML = `<div class="card create-account-card"><div class="card-header"><div><h3>Create employee account</h3><p class="muted">Username, name, password, and expiry date are required. Email is optional.</p></div></div><form id="employee-form" class="employee-form"><label>Username <span class="required-mark">*</span><input name="username" required></label><label>Full name <span class="required-mark">*</span><input name="name" required></label><label>Email address <span class="optional-mark">(optional)</span><input name="email" type="email"></label><label>Password <span class="required-mark">*</span><input name="password" type="password" minlength="6" required></label><label>Expiry date <span class="required-mark">*</span><input name="expiresAt" type="date" min="${today()}" required></label><button class="primary-button" type="submit">Create account</button></form></div><div class="card"><div class="card-header"><div><h3>Employee accounts</h3><p class="muted">Disable accounts temporarily or allow them to log in until their expiry date.</p></div></div><div class="table-card"><table><thead><tr><th>Username</th><th>Name</th><th>Email</th><th>Expiry date</th><th>Status</th><th>Option</th></tr></thead><tbody>${data.employees.map((employee, index) => { const expired = employee.expiresAt && employee.expiresAt < today(); const active = employee.active !== false && !expired; return `<tr><td><strong>${esc(employee.username || '')}</strong></td><td>${esc(employee.name)}</td><td>${esc(employee.email || 'Not provided')}</td><td>${esc(employee.expiresAt || 'Not set')}</td><td><span class="status ${active ? 'ready' : 'pending'}">${active ? 'Enabled' : expired ? 'Expired' : 'Disabled'}</span></td><td><button class="${active ? 'danger-button' : 'secondary-button'} toggle-employee" data-index="${index}">${active ? 'Disable' : 'Enable'}</button></td></tr>`; }).join('')}</tbody></table></div></div>`;
  document.querySelector('#employee-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const name = form.get('name').trim();
    const username = form.get('username').trim().toLowerCase();
    const email = form.get('email').trim().toLowerCase();
    const password = form.get('password');
    const expiresAt = form.get('expiresAt');
    if (users[username]) { showToast('That username is already in use'); return; }
    if (email && Object.values(users).some(user => (user.contactEmail || user.email) === email)) { showToast('That email is already in use'); return; }
    data.employees.push({ name, username, email, password, role: 'Employee', active: true, expiresAt });
    users[username] = { email: username, password, name, username, contactEmail: email, role: 'Employee', active: true, expiresAt };
    save();
    renderEmployees();
    showToast('Employee account created');
  });
  document.querySelectorAll('.toggle-employee').forEach(button => button.addEventListener('click', () => { const employee = data.employees[Number(button.dataset.index)]; if (!employee) return; employee.active = employee.active === false; const username = (employee.username || employee.email || '').toLowerCase(); if (users[username]) users[username].active = employee.active; save(); renderEmployees(); showToast(employee.active ? 'Employee account enabled' : 'Employee account disabled'); }));
}
function renderPassword() {
  document.querySelector('#view-password').innerHTML = `<div class="card form-card"><div class="card-header"><div><h3>Reset password</h3><p class="muted">Confirm your current password before choosing a new one.</p></div></div><form id="password-form"><label>Current password <input name="currentPassword" type="password" required></label><label>New password <input name="newPassword" type="password" minlength="6" required></label><label>Confirm new password <input name="confirmPassword" type="password" minlength="6" required></label><div class="form-actions"><button class="primary-button" type="submit">Update password</button></div></form></div>`;
  document.querySelector('#password-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    const form = new FormData(event.target);
    const currentPassword = form.get('currentPassword');
    const newPassword = form.get('newPassword');
    if (currentUser.role !== 'Employee') { showToast('Only employees can reset their password here'); return; }
    if (currentUser.password !== currentPassword) { showToast('Current password is incorrect'); return; }
    if (newPassword !== form.get('confirmPassword')) { showToast('New passwords do not match'); return; }
    currentUser.password = newPassword;
    users[currentUser.email].password = newPassword;
    const employee = data.employees.find(item => (item.username || item.email || '').toLowerCase() === currentUser.email);
    if (employee) employee.password = newPassword;
    save();
    event.target.reset();
    showToast('Password updated successfully');
  });
}
function renderSettings() {
  document.querySelector('#view-settings').innerHTML = `<div class="card form-card"><div class="card-header"><div><h3>Discount settings</h3><p class="muted">Set the default discount percentage for new orders.</p></div></div><form id="settings-form"><label>Default discount (%) <input type="number" min="0" max="100" step=".01" name="defaultDiscount" value="${data.defaultDiscount || 0}"></label><button class="primary-button" type="submit">Save discount</button></form></div><div class="card danger-zone"><div class="card-header"><div><h3>Clear stored records</h3><p class="muted">Remove orders or employee accounts while keeping administrator access and settings.</p></div><div class="danger-actions"><button class="danger-button" type="button" id="clear-orders" disabled title="Order deletion is disabled">Clear all orders</button><button class="danger-button" type="button" id="clear-records">Clear orders and employees</button></div></div></div>`;
  document.querySelector('#settings-form').addEventListener('submit', event => { event.preventDefault(); data.defaultDiscount = Math.min(100, Math.max(0, Number(new FormData(event.target).get('defaultDiscount')) || 0)); save(); showToast('Default discount saved'); });
  document.querySelector('#clear-records').addEventListener('click', () => {
    if (!confirm('Clear all orders and employee accounts? This cannot be undone.')) return;
    data.orders = [];
    data.employees = [];
    Object.keys(users).forEach(loginId => {
      if (users[loginId].role !== 'Administrator') delete users[loginId];
    });
    save();
    showToast('Orders and employee accounts cleared');
    renderSettings();
  });
  document.querySelector('#clear-orders').addEventListener('click', () => {
    if (!confirm('Delete all orders? This cannot be undone.')) return;
    data.orders = [];
    save();
    showToast('All orders deleted');
    renderSettings();
  });
}
function renderInventory() {
  const items = Object.keys(data.prices);
  document.querySelector('#view-inventory').innerHTML = `<div class="card"><div class="card-header"><div><h3>Inventory</h3><p class="muted">Update service prices and available quantities.</p></div><button type="button" class="secondary-button" id="add-inventory-item">＋ Add item</button></div><form id="inventory-form"><div class="table-card"><table><thead><tr><th>Item</th><th>Price (GH₵)</th><th>Available quantity</th><th>Action</th></tr></thead><tbody>${items.map(item => `<tr><td><strong>${esc(item)}</strong></td><td><input name="price-${esc(item)}" type="number" min="0" step=".01" value="${data.prices[item]}"></td><td><input name="quantity-${esc(item)}" type="number" min="0" step="1" value="${data.inventory?.[item] || 0}"></td><td><button type="button" class="danger-button remove-inventory-item" data-item="${esc(item)}">Remove</button></td></tr>`).join('')}</tbody></table></div><div class="form-actions"><button class="primary-button" type="submit">Save inventory</button></div></form></div>`;
  document.querySelector('#inventory-form').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.target); items.forEach(item => { data.prices[item] = Math.max(0, Number(form.get(`price-${item}`)) || 0); data.inventory[item] = Math.max(0, Number(form.get(`quantity-${item}`)) || 0); }); save(); renderInventory(); showToast('Inventory updated'); });
  document.querySelector('#add-inventory-item').addEventListener('click', () => { const item = prompt('Item name:')?.trim(); if (!item || data.prices[item]) return; data.prices[item] = 0; data.inventory[item] = 0; save(); renderInventory(); showToast('Inventory item added'); });
  document.querySelectorAll('.remove-inventory-item').forEach(button => button.addEventListener('click', () => { const item = button.dataset.item; if (!confirm(`Remove ${item} from inventory?`)) return; delete data.prices[item]; delete data.inventory[item]; save(); renderInventory(); showToast('Inventory item removed'); }));
}
function renderReports() {
  document.querySelector('#view-reports').innerHTML = `<div class="card"><div class="card-header"><div><h3>Sales report</h3><p class="muted">Review orders and revenue for a selected period.</p></div><div class="form-actions"><button class="secondary-button" id="export-report">Export Excel</button><button class="primary-button" id="print-report">Print report</button></div></div><div class="report-filters"><label>From <input id="report-from" type="date"></label><label>To <input id="report-to" type="date"></label><label>Status <select id="report-status"><option value="All">All statuses</option><option>Pending</option><option>In progress</option><option>Ready</option></select></label></div><div id="report-content"></div></div>`;
  const renderFilteredReport = () => {
    const from = document.querySelector('#report-from').value;
    const to = document.querySelector('#report-to').value;
    const status = document.querySelector('#report-status').value;
    const filtered = data.orders.filter(order => (!from || order.delivery >= from) && (!to || order.delivery <= to) && (status === 'All' || order.status === status));
    const revenue = filtered.reduce((sum, order) => sum + total(order), 0);
    const subtotal = filtered.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.qty * item.price, 0), 0);
    document.querySelector('#report-content').innerHTML = `<div class="grid report-stats"><div class="card stat-card"><p>Orders</p><strong>${filtered.length}</strong></div><div class="card stat-card"><p>Revenue</p><strong class="accent">${money(revenue)}</strong></div><div class="card stat-card"><p>Subtotal</p><strong>${money(subtotal)}</strong></div><div class="card stat-card"><p>Discounts</p><strong>${money(subtotal - revenue)}</strong></div><div class="card report-table-card">${ordersTable(filtered, false)}</div></div>`;
  };
  ['report-from', 'report-to', 'report-status'].forEach(id => document.querySelector(`#${id}`).addEventListener('change', renderFilteredReport));
  document.querySelector('#export-report').addEventListener('click', () => {
    const from = document.querySelector('#report-from').value;
    const to = document.querySelector('#report-to').value;
    const status = document.querySelector('#report-status').value;
    const filtered = data.orders.filter(order => (!from || order.delivery >= from) && (!to || order.delivery <= to) && (status === 'All' || order.status === status));
    const subtotal = filtered.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.qty * item.price, 0), 0);
    const revenue = filtered.reduce((sum, order) => sum + total(order), 0);
    const rows = filtered.map(order => {
      const items = order.items.map(item => `${item.name} (${item.qty})`).join(', ');
      return `<tr><td>${esc(order.id)}</td><td>${esc(order.customer)}</td><td>${esc(order.phone)}</td><td>${esc(items)}</td><td>${esc(order.delivery)}</td><td>${esc(order.payment)}</td><td>${money(order.items.reduce((sum, item) => sum + item.qty * item.price, 0))}</td><td>${order.discount || 0}%</td><td>${money(total(order))}</td><td>${esc(order.status)}</td></tr>`;
    }).join('');
    const workbook = `<html><head><meta charset="UTF-8"><style>body{font-family:Arial}h1{color:#17243d}table{border-collapse:collapse}th,td{border:1px solid #b8c2d6;padding:8px;text-align:left}th{background:#dfe7ff;font-weight:bold}.summary{font-weight:bold;background:#eef2ff}</style></head><body><h1>MK Laundry Service - Sales Report</h1><p>Generated: ${esc(new Date().toLocaleString())}</p><p>Filters: ${esc(from || 'All dates')} to ${esc(to || 'All dates')} | Status: ${esc(status)}</p><table><thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Items</th><th>Delivery date</th><th>Payment method</th><th>Subtotal</th><th>Discount</th><th>Amount paid</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="10">No orders found</td></tr>'}</tbody><tfoot><tr class="summary"><td colspan="6">Totals</td><td>${money(subtotal)}</td><td></td><td>${money(revenue)}</td><td>${filtered.length} order(s)</td></tr></tfoot></table></body></html>`;
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MK-Laundry-Sales-Report-${today()}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Excel report downloaded');
  });
  document.querySelector('#print-report').addEventListener('click', () => {
    const content = document.querySelector('#report-content').innerHTML;
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) { showToast('Please allow pop-ups to print the report'); return; }
    printWindow.document.write(`<!doctype html><html><head><title>MK Laundry Service Report</title><style>body{font:14px Arial;color:#17243d;padding:30px}h1{font-style:italic;color:#3867f2}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-bottom:1px solid #ddd}th{font-size:11px;text-transform:uppercase}.card{margin:12px 0}.report-stats{display:block}.stat-card{display:inline-block;width:22%;margin-right:2%;vertical-align:top}.stat-card strong{font-size:22px}.muted{color:#778198}</style></head><body><h1>MK Laundry Service</h1><h2>Sales report</h2><p>Generated ${new Date().toLocaleString()}</p>${content}</body></html>`);
    printWindow.document.close(); printWindow.focus(); printWindow.onload = () => printWindow.print();
  });
  renderFilteredReport();
}
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
