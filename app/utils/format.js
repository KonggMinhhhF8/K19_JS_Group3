export function formatCurrency(amount) {
  if (!amount && amount !== 0) return "—";
  return Number(amount).toLocaleString("vi-VN") + "đ";
}

export function formatProducts(order) {
  if (!order.product) return "—";
  return `${order.product.name} (x${order.amount})`;
}
