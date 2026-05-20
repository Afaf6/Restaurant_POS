import { useEffect, useState } from "react";
import apiFetch from "../../api/apiFetch";
import style from "./Orders.module.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // For receipt modal
  const [foldedDates, setFoldedDates] = useState({});
  const role = localStorage.getItem("role") || "Cashier";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = filterStatus ? `/orders?status=${filterStatus}` : "/orders";
      const data = await apiFetch(url);
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus, e) => {
    e.stopPropagation(); // Prevent opening modal when clicking buttons
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handlePrintReceipt = (e) => {
    e.stopPropagation();
    window.print();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderNumber && String(order.orderNumber).includes(searchQuery)) ||
      (order.cashier?.userName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const groupedOrders = filteredOrders.reduce((acc, order) => {
    const dateKey = new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(order);
    return acc;
  }, {});

  const toggleFold = (dateKey) => {
    setFoldedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  if (loading) {
    return (
      <div className={style.centeredContainer}>
        <div className={style.spinner}></div>
        <p>Retrieving transaction logs...</p>
      </div>
    );
  }

  return (
    <div className={style.container}>
      {/* Top Banner section */}
      <div className={style.banner}>
        <div className={style.bannerContent}>
          <h2>Transaction History</h2>
          <p>Review, track, and manage all dining & takeaway orders.</p>
        </div>
        <div className={style.stats}>
          <div className={style.statCard}>
            <span className={style.statVal}>{orders.length}</span>
            <span className={style.statLbl}>Total Orders</span>
          </div>
          <div className={style.statCard}>
            <span className={style.statVal}>
              ${orders
                .filter((o) => o.status === "completed")
                .reduce((sum, o) => sum + o.totalPrice, 0)
                .toFixed(2)}
            </span>
            <span className={style.statLbl}>Completed Sales</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className={style.controlBar}>
        <div className={style.searchWrap}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search by Order ID or Cashier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={style.filterWrap}>
          <button
            onClick={() => setFilterStatus("")}
            className={`${style.filterBtn} ${filterStatus === "" ? style.activeFilter : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`${style.filterBtn} ${filterStatus === "pending" ? style.activeFilter : ""}`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`${style.filterBtn} ${filterStatus === "completed" ? style.activeFilter : ""}`}
          >
            ✅ Completed
          </button>
          <button
            onClick={() => setFilterStatus("cancelled")}
            className={`${style.filterBtn} ${filterStatus === "cancelled" ? style.activeFilter : ""}`}
          >
            ❌ Cancelled
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {Object.keys(groupedOrders).length === 0 ? (
        <div className={style.emptyState}>
          <i className="fa-regular fa-folder-open"></i>
          <h3>No Orders Found</h3>
          <p>We couldn't find any transactions matching your filters.</p>
        </div>
      ) : (
        <div className={style.ordersContainer}>
          {Object.keys(groupedOrders).map((dateKey) => (
            <div key={dateKey} className={style.dateGroup}>
              <div
                className={style.dateHeader}
                onClick={() => toggleFold(dateKey)}
              >
                <h3>{dateKey}</h3>
                <div className={style.dateStats}>
                  <span>{groupedOrders[dateKey].length} orders</span>
                  <i
                    className={`fa-solid fa-chevron-${
                      foldedDates[dateKey] ? "down" : "up"
                    }`}
                  ></i>
                </div>
              </div>
              
              {!foldedDates[dateKey] && (
                <div className={style.ordersGrid}>
                  {groupedOrders[dateKey].map((order) => (
                    <div
                      key={order._id}
                      className={style.orderCard}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className={style.cardHeader}>
                        <div>
                          <span className={style.orderId}>
                            {order.orderNumber 
                              ? `#${String(order.orderNumber).padStart(5, '0')}` 
                              : `#${order._id.substring(18).toUpperCase()}`}
                          </span>
                          <span className={style.timestamp}>
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <span className={`${style.statusBadge} ${style[order.status]}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className={style.cardBody}>
                        <div className={style.cashierRow}>
                          <i className="fa-regular fa-user"></i>
                          <span>Server: {order.cashier?.userName || "System"}</span>
                        </div>
                        <div className={style.itemSnippet}>
                          {order.items.slice(0, 2).map((item, idx) => (
                            <span key={idx} className={style.snippetTag}>
                              {item.product?.name || "Item"} x{item.quantity}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className={style.moreItems}>+{order.items.length - 2} more</span>
                          )}
                        </div>
                      </div>

                      <div className={style.cardFooter}>
                        <span className={style.totalPrice}>
                          ${order.totalPrice.toFixed(2)}
                        </span>
                        <div className={style.actions}>
                          {(role === "Admin" || role === "Super Admin") && order.status === "pending" && (
                            <>
                              <button
                                onClick={(e) => handleStatusChange(order._id, "completed", e)}
                                className={style.completeBtn}
                                title="Mark Completed"
                              >
                                <i className="fa-solid fa-check"></i>
                              </button>
                              <button
                                onClick={(e) => handleStatusChange(order._id, "cancelled", e)}
                                className={style.cancelBtn}
                                title="Cancel Order"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </>
                          )}
                          {role === "Super Admin" && order.status === "completed" && (
                              <button
                                onClick={(e) => handleStatusChange(order._id, "refunded", e)}
                                className={style.refundBtn}
                                title="Refund Order"
                              >
                                <i className="fa-solid fa-rotate-left"></i>
                              </button>
                          )}
                          <button className={style.receiptBtn} title="View Invoice">
                            <i className="fa-solid fa-receipt"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RECEIPT MODAL */}
      {selectedOrder && (
        <div className={style.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={style.closeModal} onClick={() => setSelectedOrder(null)}>
              ✕
            </button>
            <div className={style.receiptPaper}>
              <div className={style.receiptHeader}>
                <h3>FRESHBITE BISTRO</h3>
                <p>123 Gourmet Ave, Food City</p>
                <div className={style.divider}></div>
                <h4>SALE RECEIPT</h4>
                <div className={style.receiptMeta}>
                  <span>
                    <strong>Order Number:</strong>{" "}
                    {selectedOrder.orderNumber 
                      ? `#${String(selectedOrder.orderNumber).padStart(5, '0')}` 
                      : `#${selectedOrder._id.toUpperCase()}`}
                  </span>
                  <span><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  <span><strong>Server:</strong> {selectedOrder.cashier?.userName || "System"}</span>
                  <span>
                    <strong>Status:</strong>{" "}
                    <span className={`${style.statusText} ${style[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </span>
                </div>
              </div>

              <div className={style.divider}></div>

              <table className={style.receiptTable}>
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th>QTY</th>
                    <th style={{ textAlign: "right" }}>PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product?.name || "Deleted Product"}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: "right" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={style.divider}></div>

              <div className={style.receiptTotals}>
                <div className={style.totalRow}>
                  <span>Subtotal</span>
                  <span>${(selectedOrder.totalPrice / 1.08).toFixed(2)}</span>
                </div>
                <div className={style.totalRow}>
                  <span>Tax (8%)</span>
                  <span>{(selectedOrder.totalPrice - selectedOrder.totalPrice / 1.08).toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className={style.totalRow} style={{ color: "green" }}>
                    <span>Discount {selectedOrder.promoCode ? `(${selectedOrder.promoCode})` : ""}</span>
                    <span>−${selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className={`${style.totalRow} ${style.grandTotal}`}>
                  <span>TOTAL PAID</span>
                  <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className={style.receiptFooter}>
                <p>Thank you for dining with us!</p>
                <p>Please visit us again.</p>
              </div>
            </div>

            <div className={style.modalActions}>
              <button onClick={handlePrintReceipt} className={style.modalPrintBtn}>
                <i className="fa-solid fa-print"></i> Print Receipt
              </button>
              {(role === "Admin" || role === "Super Admin") && selectedOrder.status === "pending" && (
                <div className={style.modalAdminActions}>
                  <button
                    onClick={(e) => handleStatusChange(selectedOrder._id, "completed", e)}
                    className={style.modalCompleteBtn}
                  >
                    Complete Order
                  </button>
                  <button
                    onClick={(e) => handleStatusChange(selectedOrder._id, "cancelled", e)}
                    className={style.modalCancelBtn}
                  >
                    Void Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
