"use client";

import { useEffect, useState } from "react";

type Order = {
  id:         string;
  total:      number;
  status:     string;
  created_at: string;
  shipping: {
    firstName: string;
    lastName:  string;
    email:     string;
    address:   string;
    city:      string;
    zip:       string;
  };
  order_items: {
    id:           number;
    product_name: string;
    quantity:     number;
    price:        number;
  }[];
};

const statusColors: Record<string, string> = {
  confirmed:  "bg-blue-100 text-blue-700",
  shipped:    "bg-amber-100 text-amber-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [updating, setUpdating]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    await fetch(`/api/admin/orders/${orderId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    setUpdating(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Orders</h1>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-100 bg-stone-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Total</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-stone-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <>
                  <tr
                    key={order.id}
                    className="hover:bg-stone-50 transition-colors cursor-pointer"
                    onClick={() =>
                      setExpanded(expanded === order.id ? null : order.id)
                    }
                  >
                    <td className="px-5 py-4 font-mono text-xs text-stone-600">
                      {order.id}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {order.shipping.firstName} {order.shipping.lastName}
                      </p>
                      <p className="text-xs text-stone-400">{order.shipping.email}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold">${order.total}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white disabled:opacity-50"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>

                  {/* Expanded order items */}
                  {expanded === order.id && (
                    <tr key={`${order.id}-expanded`}>
                      <td colSpan={6} className="px-5 py-4 bg-stone-50">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">
                            Order items
                          </p>
                          {order.order_items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-stone-700">{item.product_name}</span>
                              <span className="text-stone-500">
                                {item.quantity} × ${item.price} ={" "}
                                <span className="font-medium text-stone-900">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </span>
                              </span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-stone-200 flex justify-between font-medium">
                            <span>Total</span>
                            <span>${order.total}</span>
                          </div>
                          <p className="text-xs text-stone-400 pt-1">
                            Ship to: {order.shipping.address}, {order.shipping.city} {order.shipping.zip}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}