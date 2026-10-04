import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { posApi, staysApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/store/app.store";
import { ShoppingCart, Plus, Minus, CheckCircle2 } from "lucide-react";
import type { MenuItem } from "@/types";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export const PosOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<"DINE_IN" | "ROOM_SERVICE" | "TAKEAWAY">("ROOM_SERVICE");
  const [selectedStayId, setSelectedStayId] = useState("");

  const { data: activeStays } = useQuery({
    queryKey: ["stays", "active"],
    queryFn: () => staysApi.getActive(),
  });

  const createOrderMutation = useMutation({
    mutationFn: posApi.createOrder,
    onSuccess: () => {
      addToast("POS Order submitted successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["pos"] });
      setCart([]);
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.message || "Order submission failed", "error");
    },
  });

  const menuItems: MenuItem[] = [
    { id: "m1", name: "Club Sandwich", price: 14.5, description: "Triple decker with turkey & bacon", category_id: "c1", code: "CS01", cost_price: 4, is_available: true, is_veg: false, preparation_time: 15, image_url: null, tax_ids: null, sort_order: 1, created_at: "", updated_at: "", property_id: "", organization_id: "" },
    { id: "m2", name: "Margherita Pizza", price: 18.0, description: "Fresh mozzarella, tomato sauce & basil", category_id: "c1", code: "MP01", cost_price: 5, is_available: true, is_veg: true, preparation_time: 20, image_url: null, tax_ids: null, sort_order: 2, created_at: "", updated_at: "", property_id: "", organization_id: "" },
    { id: "m3", name: "Espresso Coffee", price: 4.5, description: "Double shot dark roast espresso", category_id: "c2", code: "EC01", cost_price: 1, is_available: true, is_veg: true, preparation_time: 5, image_url: null, tax_ids: null, sort_order: 3, created_at: "", updated_at: "", property_id: "", organization_id: "" },
    { id: "m4", name: "Fresh Orange Juice", price: 6.0, description: "100% freshly squeezed juice", category_id: "c2", code: "OJ01", cost_price: 1.5, is_available: true, is_veg: true, preparation_time: 5, image_url: null, tax_ids: null, sort_order: 4, created_at: "", updated_at: "", property_id: "", organization_id: "" },
  ];

  const filteredItems = menuItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.menuItem.id === itemId) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((acc, c) => acc + c.menuItem.price * c.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckoutOrder = () => {
    if (cart.length === 0) return;
    createOrderMutation.mutate({
      order_type: orderType,
      stay_id: orderType === "ROOM_SERVICE" ? selectedStayId : undefined,
      items: cart.map((c) => ({
        menu_item_id: c.menuItem.id,
        quantity: c.quantity,
        unit_price: c.menuItem.price,
      })),
      total_amount: total,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="POS Order Terminal"
        subtitle="High-speed Point of Sale and Room Service ordering."
        breadcrumbs={[{ label: "POS" }, { label: "Terminal" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search dishes or beverages..."
            className="w-full"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500 cursor-pointer transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              Order Cart ({cart.length})
            </h3>

            <div className="flex items-center gap-2">
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full"
              >
                <option value="ROOM_SERVICE">Room Service</option>
                <option value="DINE_IN">Dine In (Table)</option>
                <option value="TAKEAWAY">Takeaway</option>
              </select>
            </div>

            {orderType === "ROOM_SERVICE" && (
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Select In-House Room
                </label>
                <select
                  value={selectedStayId}
                  onChange={(e) => setSelectedStayId(e.target.value)}
                  className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full"
                >
                  <option value="">Select Room...</option>
                  {activeStays?.map((stay) => (
                    <option key={stay.id} value={stay.id}>
                      Room {stay.room?.number} — {stay.guest?.first_name} {stay.guest?.last_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {cart.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 text-center">Cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.menuItem.id} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.menuItem.name}</p>
                      <p className="text-[10px] text-slate-500">{formatCurrency(item.menuItem.price)} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, -1)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, 1)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Tax (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
              <span>Total</span>
              <span className="text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
            </div>

            <Button
              className="w-full mt-3"
              disabled={cart.length === 0}
              isLoading={createOrderMutation.isPending}
              onClick={handleCheckoutOrder}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
