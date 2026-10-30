const SESSION_KEY = 'mk-laundry-session';
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin';

const state = {
  orders: [],
  employees: [{ username: 'admin', fullName: 'Administrator', phone: '', email: '', password: 'admin', role: 'Administrator' }],
  inventory: []
};

let currentUser = null;

const viewTitles = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  'new-order': 'New order',
  password: 'Change password',
  employees: 'Employees',
  inventory: 'Inventory',
  reports: 'Reports',
  settings: 'Settings'
};

const managerViews = new Set(['dashboard', 'orders', 'new-order', 'inventory', 'reports']);
const employeeViews = new Set(['dashboard', 'orders', 'new-order']);

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function formatCurrency(amount) {
  return `GH₵${Number(amount || 0).toFixed(2)}`;
}

function showApp(userName) {
  currentUser = state.employees.find(employee => employee.username === userName) || { username: userName, fullName: userName, role: 'Administrator' };
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  document.getElementById('user-name').textContent = currentUser.fullName || userName;
  document.getElementById('user-role').textContent = currentUser.role;
  document.getElementById('user-avatar').textContent = userName.charAt(0).toUpperCase();
  document.getElementById('today-label').textContent = new Date().toLocaleDateString();
  applyPermissions();
  renderView('dashboard');
}

function applyPermissions() {
  const role = currentUser?.role || 'Employee';
  document.querySelectorAll('.nav-item').forEach(item => {
    const viewName = item.dataset.view;
    const allowed = role === 'Administrator'
      || (role === 'Manager' && managerViews.has(viewName))
      || (role === 'Employee' && employeeViews.has(viewName));
    item.classList.toggle('hidden', !allowed);
  });
  document.querySelectorAll('.admin-only').forEach(element => {
    element.classList.toggle('hidden', role !== 'Administrator');
  });
  document.querySelectorAll('#password-button.employee-only').forEach(element => {
    element.classList.toggle('hidden', role === 'Administrator');
  });
}

function showLogin() {
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
}

async function loadState() {
  try {
    const response = await fetch('/api/state');
    if (!response.ok) throw new Error(`State request failed (${response.status})`);
    const savedState = await response.json();
    Object.assign(state, savedState);
    if (!Array.isArray(state.employees) || state.employees.length === 0) {
      state.employees = [{ username: 'admin', fullName: 'Administrator', phone: '', email: '', password: 'admin', role: 'Administrator' }];
    }
    state.employees = state.employees.map(employee => ({
      ...employee,
      fullName: employee.fullName || (employee.username === 'admin' ? 'Administrator' : employee.username),
      phone: employee.phone === '' || employee.phone == null ? '' : Number(employee.phone),
      email: employee.email || ''
    }));
    state.orders = state.orders.map(order => ({ ...order, id: order.id || `${Date.now()}-${Math.random().toString(36).slice(2)}` }));
  } catch (error) {
    console.error(error);
  }
}

async function saveState() {
  try {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    if (!response.ok) throw new Error(`State save failed (${response.status})`);
  } catch (error) {
    console.error(error);
    alert('Could not save your changes.');
  }
}

function renderView(viewName) {
  document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
  const view = document.getElementById(`view-${viewName}`);
  if (!view) return;
  view.classList.remove('hidden');
  document.getElementById('page-title').textContent = viewTitles[viewName] || viewName;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  if (viewName === 'dashboard') renderDashboard(view);
  if (viewName === 'orders') renderOrders(view);
  if (viewName === 'new-order') renderNewOrder(view);
  if (viewName === 'employees') renderEmployees(view);
  if (viewName === 'inventory') renderInventory(view);
  if (viewName === 'reports') renderReports(view);
  if (viewName === 'settings') renderSettings(view);
  if (viewName === 'password') renderPassword(view);
}

function renderDashboard(view) {
  const total = state.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  view.innerHTML = `
    <div class="grid stats-grid">
      <div class="card stat-card"><p>Total orders</p><strong>${state.orders.length}</strong></div>
      <div class="card stat-card"><p>Pending orders</p><strong>${state.orders.filter(order => order.status !== 'Completed').length}</strong></div>
      <div class="card stat-card"><p>Completed orders</p><strong>${state.orders.filter(order => order.status === 'Completed').length}</strong></div>
      <div class="card stat-card"><p>Total revenue</p><strong>${formatCurrency(total)}</strong></div>
    </div>
    <div class="card table-card" style="margin-top:22px">
      <div class="card-header"><h3>Recent orders</h3><button class="secondary-button" data-go="new-order">New order</button></div>
      ${ordersTable(state.orders.slice(-5).reverse())}
    </div>`;
  view.querySelector('[data-go="new-order"]').addEventListener('click', () => renderView('new-order'));
  bindOrderActions(view);
}

function ordersTable(orders) {
  if (!orders.length) return '<div class="empty">No orders yet. Create your first order.</div>';
  return `<table><thead><tr><th>Customer</th><th>Phone</th><th>Delivery</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${orders.map(order => {
      const completed = order.status === 'Completed' || order.status === 'Ready';
      return `<tr><td><strong>${escapeHtml(order.name)}</strong></td><td>${escapeHtml(order.phone)}</td><td>${escapeHtml(order.delivery)}</td><td>${formatCurrency(order.total)}</td><td><span class="status ${completed ? 'ready' : 'pending'}">${completed ? 'Completed' : 'Pending'}</span></td><td>
        ${completed
          ? `<button class="secondary-button" data-invoice="${escapeHtml(order.id)}">Generate invoice</button>`
          : '<span class="muted">Invoice available after completion</span>'}
        ${completed ? '' : `<button class="primary-button" data-complete="${escapeHtml(order.id)}">Mark completed</button>`}
      </td></tr>`;
    }).join('')}
  </tbody></table>`;
}

function printInvoice(order) {
  const invoiceNumber = String(order.id || '').slice(-8).toUpperCase();
  const invoiceDate = new Date().toLocaleDateString();
  const tellerName = currentUser?.fullName || currentUser?.username || 'Administrator';
  const itemRows = (order.items || []).map(item => `<tr>
    <td><strong>${escapeHtml(item.name)}</strong><small> Laundry service</small></td>
    <td class="center">${item.quantity}</td>
    <td class="right">${formatCurrency(item.unitPrice)}</td>
    <td class="right strong">${formatCurrency(item.quantity * item.unitPrice)}</td>
  </tr>`).join('');
  const invoiceHtml = `<!doctype html><html><head><title>Invoice - ${escapeHtml(order.name)}</title>
    <style id="invoice-print-style">
      @page{size:80mm auto;margin:0}
      :root{--navy:#17243d;--ink:#202733;--muted:#6d7480;--line:#cfd4da}
      *{box-sizing:border-box}html,body{width:80mm;height:auto;min-height:0;margin:0;padding:0;background:#fff}body{color:var(--ink);font:10px Arial,sans-serif}
      .sheet{width:80mm;height:auto;min-height:0;margin:0 auto;background:#fff;overflow:hidden}
      .header{padding:2mm 4mm 3mm;border-bottom:1px dashed var(--navy);background:#fff}
      .brand{display:block;text-align:center}.logo{display:inline-grid;place-items:center;width:9mm;height:9mm;margin-right:2mm;background:var(--navy);color:#fff;border-radius:1mm;font-weight:900;font-size:11px;vertical-align:middle}
      h1{display:inline-block;margin:0;font-size:13px;vertical-align:middle;letter-spacing:-.3px}.subtitle{margin:1mm 0 0;color:var(--muted);font-size:8px}
      .invoice-label{text-align:center;margin-top:2mm}.invoice-label h2{margin:0 0 1mm;color:var(--navy);font-size:14px;letter-spacing:1px}.invoice-label p{display:inline;margin:0 2mm;color:var(--muted);font-size:8px}
      .content{padding:4mm}.info-grid{display:block;margin-bottom:4mm}.info-card{padding:0 0 3mm;margin-bottom:3mm;background:#fff;border:0;border-bottom:1px dashed var(--line);border-radius:0}.info-card h3{margin:0 0 1mm;color:var(--muted);font-size:8px;letter-spacing:1px;text-transform:uppercase}.info-card p{margin:1mm 0;line-height:1.3}.muted{color:var(--muted)}
      table{width:100%;border-collapse:collapse;table-layout:fixed}th{padding:2mm 1mm;border-bottom:1px solid var(--line);color:var(--muted);font-size:8px;text-align:left;text-transform:uppercase}td{padding:2mm 1mm;border-bottom:1px dashed var(--line);word-wrap:break-word}td small{display:block;margin-top:1mm;color:var(--muted);font-size:8px}.center{text-align:center}.right{text-align:right}.strong{font-weight:700}
      th:nth-child(1){width:39%}th:nth-child(2){width:12%}th:nth-child(3){width:24%}th:nth-child(4){width:25%}
      .summary{display:block;margin-top:4mm}.total-box{padding:3mm 0 0;background:#fff;border:0;border-top:1px solid var(--navy);border-radius:0}.total-row{display:flex;justify-content:space-between;align-items:center}.total-row span{color:var(--muted)}.total-row strong{color:var(--navy);font-size:17px}
      .paid{display:block;margin-top:3mm;color:var(--navy);font-size:9px;font-weight:700}.footer{margin-top:6mm;padding-top:3mm;border-top:1px dashed var(--line);color:var(--muted);font-size:9px;text-align:center}
      @media print{html,body{width:80mm;height:auto;min-height:0}.sheet{width:80mm;height:auto;min-height:0}}
      @media screen{#print-invoice-root{position:fixed;inset:0;z-index:9999;overflow:auto;background:#fff}#print-invoice-root .sheet{margin:0 auto}}
      @media print{body>*:not(#print-invoice-root){display:none!important}#print-invoice-root{display:block!important;width:80mm!important}}
    </style>
    </head><body><main class="sheet">
      <header class="header"><div class="brand"><div><span class="logo">MK</span><h1>MK Laundry Service</h1><p class="subtitle">Location: Hohoe</p></div><div class="invoice-label"><h2>INVOICE</h2><p>Ref: #${invoiceNumber}</p><p>Issued ${invoiceDate}</p></div></div></header>
      <section class="content"><div class="info-grid">
        <div class="info-card"><h3>Billed to</h3><p><strong>${escapeHtml(order.name)}</strong></p><p class="muted">${escapeHtml(order.phone)}</p></div>
        <div class="info-card"><h3>Order details</h3><p><strong>Delivery date:</strong> ${escapeHtml(order.delivery)}</p><p><strong>Payment:</strong> ${escapeHtml(order.payment)}</p><p><strong>Teller:</strong> ${escapeHtml(tellerName)}</p></div>
      </div>
      <table><thead><tr><th>Item description</th><th class="center">Qty</th><th class="right">Unit price</th><th class="right">Amount</th></tr></thead><tbody>${itemRows}</tbody></table>
      <div class="summary"><div class="total-box"><div class="total-row"><span>Total due</span><strong>${formatCurrency(order.total)}</strong></div><span class="paid">PAYMENT: ${escapeHtml(order.payment).toUpperCase()}</span></div></div>
      <div class="footer">Thank you for choosing MK Laundry Service.<br>We appreciate your business.</div></section>
    </main></body></html>`;

  const parsedInvoice = new DOMParser().parseFromString(invoiceHtml, 'text/html');
  const printRoot = document.createElement('div');
  printRoot.id = 'print-invoice-root';
  printRoot.innerHTML = `${parsedInvoice.head.querySelector('style')?.outerHTML || ''}${parsedInvoice.body.innerHTML}`;
  const appShell = document.getElementById('app-shell');
  const loginScreen = document.getElementById('login-screen');
  appShell.classList.add('print-hidden');
  loginScreen.classList.add('print-hidden');
  document.body.appendChild(printRoot);

  const cleanupPrint = () => {
    printRoot.remove();
    appShell.classList.remove('print-hidden');
    loginScreen.classList.remove('print-hidden');
    window.removeEventListener('afterprint', cleanupPrint);
  };
  window.addEventListener('afterprint', cleanupPrint);
  window.setTimeout(() => window.print(), 100);
}

function renderOrders(view) {
  view.innerHTML = `<div class="toolbar"><input id="order-search" placeholder="Search orders"><button class="primary-button" id="orders-new">New order</button></div><div class="card table-card" id="orders-table">${ordersTable(state.orders)}</div>`;
  view.querySelector('#orders-new').addEventListener('click', () => renderView('new-order'));
  bindOrderActions(view);
  view.querySelector('#order-search').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    view.querySelector('#orders-table').innerHTML = ordersTable(state.orders.filter(order => JSON.stringify(order).toLowerCase().includes(query)));
    bindOrderActions(view);
  });
}

function bindOrderActions(view) {
  view.querySelectorAll('[data-complete]').forEach(button => button.addEventListener('click', async () => {
    const order = state.orders.find(candidate => candidate.id === button.dataset.complete);
    if (!order) return;
    order.status = 'Completed';
    await saveState();
    renderView('orders');
  }));
  view.querySelectorAll('[data-invoice]').forEach(button => button.addEventListener('click', () => {
    const order = state.orders.find(candidate => candidate.id === button.dataset.invoice);
    if (order && (order.status === 'Completed' || order.status === 'Ready')) printInvoice(order);
  }));
}

function renderNewOrder(view) {
  const inventoryOptions = state.inventory.length
    ? state.inventory.map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} (${formatCurrency(Math.max(0, Number(item.unitCost || 0) - Number(item.discount || 0)))})</option>`).join('')
    : '<option value="">No inventory items available</option>';
  view.innerHTML = `<div class="card form-card"><form id="new-order-form"><div class="form-grid">
    <label>Customer name<input name="name" required></label><label>Phone<input name="phone" required></label>
    <label>Delivery date<input name="delivery" type="date" required></label><label>Payment mode<select name="payment"><option>Cash</option><option>Mobile money</option></select></label>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><h3>Order items</h3><button type="button" class="secondary-button" id="add-order-item">Add item</button></div>
      <div id="order-items"></div>
      <div class="amount-due"><span>Total</span><strong id="order-total">${formatCurrency(0)}</strong></div>
    </div>
    <div class="form-actions"><button type="submit" class="primary-button">Save order</button></div>
    </form></div>`;
  const form = view.querySelector('form');
  const itemsContainer = view.querySelector('#order-items');
  const totalElement = view.querySelector('#order-total');

  function updateTotal() {
    let total = 0;
    itemsContainer.querySelectorAll('.order-item-row').forEach(row => {
      const item = state.inventory.find(candidate => candidate.id === row.querySelector('[name="item"]').value);
      const quantity = Number(row.querySelector('[name="quantity"]').value || 0);
      if (item) total += quantity * Math.max(0, Number(item.unitCost || 0) - Number(item.discount || 0));
    });
    totalElement.textContent = formatCurrency(total);
  }

  function addOrderItem() {
    const row = document.createElement('div');
    row.className = 'order-item-row';
    row.style.cssText = 'display:grid;grid-template-columns:1fr 120px 40px;gap:10px;align-items:end;margin-bottom:10px';
    row.innerHTML = `<label>Item<select name="item" required>${inventoryOptions}</select></label>
      <label>Quantity<input name="quantity" type="number" min="1" step="1" value="1" required></label>
      <button type="button" class="remove-item" title="Remove item">×</button>`;
    row.querySelector('[name="item"]').addEventListener('change', updateTotal);
    row.querySelector('[name="quantity"]').addEventListener('input', updateTotal);
    row.querySelector('.remove-item').addEventListener('click', () => {
      row.remove();
      updateTotal();
    });
    itemsContainer.appendChild(row);
    updateTotal();
  }

  view.querySelector('#add-order-item').addEventListener('click', addOrderItem);
  if (state.inventory.length) addOrderItem();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const items = Array.from(itemsContainer.querySelectorAll('.order-item-row')).map(row => {
      const item = state.inventory.find(candidate => candidate.id === row.querySelector('[name="item"]').value);
      return item ? { itemId: item.id, name: item.name, quantity: Number(row.querySelector('[name="quantity"]').value), unitPrice: Math.max(0, Number(item.unitCost || 0) - Number(item.discount || 0)) } : null;
    }).filter(Boolean);
    if (!items.length) {
      alert('Add at least one item before saving the order.');
      return;
    }
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    state.orders.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: formData.get('name'), phone: formData.get('phone'), delivery: formData.get('delivery'), payment: formData.get('payment'), items, total, status: 'Pending' });
    await saveState();
    renderView('orders');
  });
}

function renderEmployees(view) {
  const rows = state.employees.map(employee => `
    <tr>
      <td><strong>${escapeHtml(employee.fullName)}</strong><br><small>${escapeHtml(employee.username)}</small></td>
      <td>${escapeHtml(employee.phone)}</td>
      <td>${escapeHtml(employee.email || 'Not provided')}</td>
      <td>${escapeHtml(employee.role)}</td>
      <td><button class="danger-button" data-remove="${escapeHtml(employee.username)}" ${employee.username === 'admin' ? 'disabled' : ''}>Remove</button></td>
    </tr>`).join('');
  view.innerHTML = `<div class="grid dashboard-grid">
    <div class="card"><div class="card-header"><h3>Add employee account</h3></div>
      <form id="employee-form">
        <label>Username <span class="required-mark">*</span><input name="username" required minlength="3"></label>
        <label>Full name <span class="required-mark">*</span><input name="fullName" required></label>
        <label>Phone number <span class="required-mark">*</span><input name="phone" type="number" min="0" step="1" required></label>
        <label>Email (optional)<input name="email" type="email"></label>
        <label>Password <span class="required-mark">*</span><input name="password" type="password" required minlength="4"></label>
        <label>Role <span class="required-mark">*</span><select name="role"><option>Employee</option><option>Manager</option></select></label>
        <button class="primary-button" type="submit">Add employee</button>
      </form>
    </div>
    <div class="card table-card"><div class="card-header"><h3>Login accounts</h3></div>
      <table><thead><tr><th>Employee</th><th>Phone</th><th>Email</th><th>Role</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
  </div>`;
  view.querySelector('#employee-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const username = String(form.get('username')).trim().toLowerCase();
    if (state.employees.some(employee => employee.username === username)) {
      alert('That username already exists.');
      return;
    }
    state.employees.push({
      fullName: String(form.get('fullName')).trim(),
      phone: Number(form.get('phone')),
      email: String(form.get('email')).trim(),
      username,
      password: String(form.get('password')),
      role: String(form.get('role'))
    });
    await saveState();
    renderView('employees');
  });
  view.querySelectorAll('[data-remove]').forEach(button => {
    button.addEventListener('click', async () => {
      state.employees = state.employees.filter(employee => employee.username !== button.dataset.remove);
      await saveState();
      renderView('employees');
    });
  });
}

function renderInventory(view) {
  const totalValue = state.inventory.reduce((sum, item) => sum + Number(item.quantity || 0) * Math.max(0, Number(item.unitCost || 0) - Number(item.discount || 0)), 0);
  view.innerHTML = `<div class="card">
    <div class="card-header"><h3>Inventory</h3><strong>${formatCurrency(totalValue)}</strong></div>
    <form id="inventory-form">
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Item name <span class="required-mark">*</span><input name="name" required></label>
        <label>Quantity <span class="required-mark">*</span><input name="quantity" type="number" min="0" step="1" required></label>
        <label>Unit cost (GH₵) <span class="required-mark">*</span><input name="unitCost" type="number" min="0" step="0.01" required></label>
        <label>Discount (GH₵)<input name="discount" type="number" min="0" step="0.01" value="0"></label>
      </div>
      <div class="form-actions"><button class="primary-button" type="submit" id="inventory-submit">Add item</button><button class="secondary-button hidden" type="button" id="inventory-cancel">Cancel edit</button></div>
    </form>
  </div>
  <div class="toolbar" style="margin-top:22px"><input id="inventory-search" placeholder="Search inventory"></div>
  <div class="card table-card" id="inventory-table">${inventoryTable(state.inventory)}</div>`;

  const form = view.querySelector('#inventory-form');
  const resetForm = () => {
    form.reset();
    form.elements.id.value = '';
    view.querySelector('#inventory-submit').textContent = 'Add item';
    view.querySelector('#inventory-cancel').classList.add('hidden');
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const item = {
      id: values.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: values.name.trim(),
      quantity: Number(values.quantity),
      unitCost: Number(values.unitCost),
      discount: Number(values.discount || 0)
    };
    const existingIndex = state.inventory.findIndex(existing => existing.id === item.id);
    if (existingIndex >= 0) state.inventory[existingIndex] = item;
    else state.inventory.push(item);
    await saveState();
    renderView('inventory');
  });
  view.querySelector('#inventory-cancel').addEventListener('click', resetForm);
  view.querySelector('#inventory-search').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    view.querySelector('#inventory-table').innerHTML = inventoryTable(state.inventory.filter(item => item.name.toLowerCase().includes(query)));
    bindInventoryActions(view, form);
  });
  bindInventoryActions(view, form);
}

function inventoryTable(items) {
  if (!items.length) return '<div class="empty">No inventory items found.</div>';
  return `<table><thead><tr><th>Item</th><th>Quantity</th><th>Unit cost</th><th>Discount</th><th>Total value</th><th>Actions</th></tr></thead><tbody>
    ${items.map(item => `<tr>
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td>${Number(item.quantity || 0)}</td>
      <td>${formatCurrency(item.unitCost)}</td>
      <td>${formatCurrency(item.discount)}</td>
      <td>${formatCurrency(Number(item.quantity || 0) * Math.max(0, Number(item.unitCost || 0) - Number(item.discount || 0)))}</td>
      <td><button class="secondary-button" data-adjust="increase" data-id="${escapeHtml(item.id)}">+</button> <button class="secondary-button" data-adjust="decrease" data-id="${escapeHtml(item.id)}">−</button> <button class="secondary-button" data-edit="${escapeHtml(item.id)}">Edit</button> <button class="danger-button" data-delete="${escapeHtml(item.id)}">Delete</button></td>
    </tr>`).join('')}
  </tbody></table>`;
}

function bindInventoryActions(view, form) {
  view.querySelectorAll('[data-adjust]').forEach(button => button.addEventListener('click', async () => {
    const item = state.inventory.find(candidate => candidate.id === button.dataset.id);
    if (!item) return;
    item.quantity = Math.max(0, Number(item.quantity) + (button.dataset.adjust === 'increase' ? 1 : -1));
    await saveState();
    renderView('inventory');
  }));
  view.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => {
    const item = state.inventory.find(candidate => candidate.id === button.dataset.edit);
    if (!item) return;
    Object.keys(item).forEach(key => {
      if (form.elements[key]) form.elements[key].value = item[key];
    });
    form.elements.id.value = item.id;
    view.querySelector('#inventory-submit').textContent = 'Update item';
    view.querySelector('#inventory-cancel').classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  view.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', async () => {
    state.inventory = state.inventory.filter(item => item.id !== button.dataset.delete);
    await saveState();
    renderView('inventory');
  }));
}

function renderReports(view) {
  const totalRevenue = state.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const completedOrders = state.orders.filter(order => order.status === 'Completed').length;
  const reportRows = state.orders.map(order => `
    <tr>
      <td>${escapeHtml(order.name)}</td>
      <td>${escapeHtml(order.phone)}</td>
      <td>${escapeHtml(order.delivery)}</td>
      <td>${escapeHtml(order.payment)}</td>
      <td>${escapeHtml(order.status)}</td>
      <td>${formatCurrency(order.total)}</td>
    </tr>`).join('');
  view.innerHTML = `<div class="card">
    <div class="card-header"><h3>Reports</h3><button class="primary-button" id="generate-excel">Generate Excel</button></div>
    <div class="grid report-stats">
      <div class="card stat-card"><p>Total orders</p><strong>${state.orders.length}</strong></div>
      <div class="card stat-card"><p>Completed orders</p><strong>${completedOrders}</strong></div>
      <div class="card stat-card"><p>Total revenue</p><strong>${formatCurrency(totalRevenue)}</strong></div>
    </div>
    <div class="table-card report-table-card" style="margin-top:22px">
      <table><thead><tr><th>Customer</th><th>Phone</th><th>Delivery date</th><th>Payment</th><th>Status</th><th>Total</th></tr></thead>
      <tbody>${reportRows || '<tr><td colspan="6" class="empty">No orders to report.</td></tr>'}</tbody></table>
    </div>
  </div>`;
  view.querySelector('#generate-excel').addEventListener('click', () => downloadExcelReport());
}

function downloadExcelReport() {
  const totalRevenue = state.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const rows = [
    ['MK Laundry Service - Order Report', '', '', '', '', ''],
    ['Generated', new Date().toLocaleString(), '', '', '', ''],
    ['Total orders', state.orders.length, '', '', '', ''],
    ['Completed orders', state.orders.filter(order => order.status === 'Completed').length, '', '', '', ''],
    ['Total revenue', totalRevenue, '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Customer', 'Phone', 'Delivery date', 'Payment', 'Status', 'Total']
  ];
  state.orders.forEach(order => {
    rows.push([
      order.name || '',
      order.phone || '',
      order.delivery || '',
      order.payment || '',
      order.status || '',
      Number(order.total || 0)
    ]);
  });
  const worksheetRows = rows.map(row => `<Row>${row.map(value => {
    const type = typeof value === 'number' ? 'Number' : 'String';
    return `<Cell><Data ss:Type="${type}">${escapeHtml(value)}</Data></Cell>`;
  }).join('')}</Row>`).join('');
  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Order Report"><Table>${worksheetRows}</Table></Worksheet>
</Workbook>`;
  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `mk-laundry-report-${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderSettings(view) {
  view.innerHTML = '<div class="card"><div class="card-header"><h3>Settings</h3></div><p>Application settings are stored on this server.</p></div>';
}

function renderPassword(view) {
  view.innerHTML = `<div class="card form-card"><h3>Change password</h3>
    <form id="password-form">
      <label>Current password<input name="current" type="password" required></label>
      <label>New password<input name="next" type="password" minlength="4" required></label>
      <label>Confirm new password<input name="confirm" type="password" minlength="4" required></label>
      <p id="password-error" class="error"></p>
      <button class="primary-button" type="submit">Change password</button>
    </form>
  </div>`;
  view.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const error = view.querySelector('#password-error');
    if (String(form.get('current')) !== currentUser.password) {
      error.textContent = 'Current password is incorrect.';
      return;
    }
    if (String(form.get('next')) !== String(form.get('confirm'))) {
      error.textContent = 'New passwords do not match.';
      return;
    }
    currentUser.password = String(form.get('next'));
    await saveState();
    error.textContent = '';
    event.target.reset();
    alert('Password changed successfully.');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const savedUser = window.localStorage.getItem(SESSION_KEY);

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => renderView(item.dataset.view));
  });
  document.getElementById('password-button').addEventListener('click', () => renderView('password'));
  document.getElementById('logout-button').addEventListener('click', () => {
    window.localStorage.removeItem(SESSION_KEY);
    showLogin();
  });

  if (savedUser) {
    await loadState();
    if (!state.employees.some(employee => employee.username === savedUser)) {
      window.localStorage.removeItem(SESSION_KEY);
    } else {
      showApp(savedUser);
    }
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const username = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    await loadState();
    const employee = state.employees.find(account => account.username === username && account.password === password);
    if (!employee) {
      loginError.textContent = 'Invalid username or password.';
      return;
    }
    window.localStorage.setItem(SESSION_KEY, username);
    loginError.textContent = '';
    loginForm.reset();
    showApp(username);
  });
});
