import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PaidUsersList({ tripId }) {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        axios.get(`/trips/${tripId}/payments`).then(res => {
            setPayments(res.data);
        });
    }, [tripId]);

    return (
        <div>
            <h3>Người đã thanh toán</h3>
            <ul>
                {payments.map(payment => (
                    <li key={payment.paymentId}>
                        {payment.user.name}: {payment.amount} USD
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PaidUsersList;
