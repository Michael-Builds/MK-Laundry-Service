const supabaseUrl = 'https://supabase.co';
const supabaseKey = 'sb_publishable_vY94uPH0vLi825SKoJ33GA_KUAg5mdL';

const supabase = window.supabase ? window.supabase : null;

if (supabase) {
  document.addEventListener('DOMContentLoaded', () => {
    const saveOrderButton = document.getElementById('save-order-btn');
    if (!saveOrderButton) return;

    saveOrderButton.addEventListener('click', async (event) => {
      event.preventDefault();

      const name = document.getElementById('customer-name')?.value || '';
      const phone = document.getElementById('customer-phone')?.value || '';
      const delivery = document.getElementById('delivery-date')?.value || '';
      const payment = document.getElementById('payment-mode')?.value || '';
      const totalAmount = Number(document.getElementById('total-price')?.value || 0) || 0;

      const { data: newOrder, error: orderError } = await supabase
        .from('laundry_orders')
        .insert([
          {
            customer_name: name,
            customer_number: phone,
            delivery_date: delivery,
            payment_mode: payment,
            total: totalAmount
          }
        ])
        .select()
        .single();

      if (orderError) {
        alert('Failed to save laundry order: ' + orderError.message);
        return;
      }

      console.log('Order successfully uploaded with ID:', newOrder?.id);
      alert('Laundry ticket uploaded to Supabase successfully!');
    });
  });
}