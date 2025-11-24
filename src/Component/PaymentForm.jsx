import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PayPalCheckout from './PayPalCheckout';
import axios from '../axios';

function PaymentForm() {
  const { tripId } = useParams();
  const [totalAmount, setTotalAmount] = useState(null);
  const [inputAmount, setInputAmount] = useState('');
  const userId = 1; // TODO: Lấy từ context/session thực tế
useEffect(() => {
  const fetchTotalAmount = async () => {
    try {
      const res = await axios.get(`/api/trips/${tripId}/total-amount`);
      const fetchedAmount = Number(res.data.totalAmount);
      if (isNaN(fetchedAmount)) {
        throw new Error('Dữ liệu tổng tiền không hợp lệ');
      }
      setTotalAmount(fetchedAmount);
      setInputAmount(fetchedAmount.toFixed(2));
    } catch (error) {
      console.error('Lỗi khi lấy tổng số tiền chuyến đi:', error);
      alert('Không thể tải thông tin tổng tiền chuyến đi.');
    }
  };

  fetchTotalAmount(); // 🔥 GỌI ở đây
}, [tripId]);


  const handlePaymentSuccess = async (paypalDetails) => {
    try {
      const paymentRes = await axios.post('/payments', {
        tripId,
        userId,
        amount: parseFloat(inputAmount),
        currency: 'USD',
        description: `PayPal - ${paypalDetails.orderID}`
      });

      await axios.put(`/payments/${paymentRes.data.paymentId}/status?status=paid`);

      alert('Thanh toán thành công!');
    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán:', error);
      alert('Có lỗi xảy ra trong quá trình xử lý thanh toán.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '1rem' }}>
      <h2>Thanh toán chuyến đi</h2>

      {totalAmount === null ? (
        <p>Đang tải tổng số tiền...</p>
      ) : (
        <>
          <p><strong>Tổng số tiền:</strong> {totalAmount.toFixed(2)} USD</p>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="amountInput">Số tiền muốn thanh toán (USD):</label>
            <input
              type="number"
              id="amountInput"
              className="form-control"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              min="1"
              step="0.01"
            />
          </div>

          {parseFloat(inputAmount) > 0 && (
            <PayPalCheckout amount={parseFloat(inputAmount)} onSuccess={handlePaymentSuccess} />
          )}
        </>
      )}
    </div>
  );
}

export default PaymentForm;
