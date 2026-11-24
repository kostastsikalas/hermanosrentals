import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Home, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Viva redirects here after a successful payment, e.g.
// /payment/success?t=<transactionId>&s=<orderCode>&lang=el-GR&eventId=0&eci=1
const PaymentSuccessPage = () => {
  const { i18n } = useTranslation();
  const isGreek = i18n.language.startsWith('el');
  const [searchParams] = useSearchParams();

  const orderCode = searchParams.get('s');
  const transactionId = searchParams.get('t');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-lg w-full p-8 md:p-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-green-600 w-11 h-11" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          {isGreek ? 'Η πληρωμή ολοκληρώθηκε!' : 'Payment Successful!'}
        </h1>
        <p className="text-slate-600 mb-8">
          {isGreek
            ? 'Ευχαριστούμε! Η πληρωμή σας έγινε με επιτυχία και η κράτησή σας επιβεβαιώθηκε. Θα λάβετε σύντομα email επιβεβαίωσης.'
            : 'Thank you! Your payment was completed and your booking is confirmed. You will receive a confirmation email shortly.'}
        </p>

        {(orderCode || transactionId) && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 text-left space-y-2 text-sm">
            {orderCode && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">{isGreek ? 'Κωδικός παραγγελίας' : 'Order code'}</span>
                <span className="font-mono font-semibold text-slate-900 break-all">{orderCode}</span>
              </div>
            )}
            {transactionId && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">{isGreek ? 'Αριθμός συναλλαγής' : 'Transaction ID'}</span>
                <span className="font-mono text-slate-900 break-all">{transactionId}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Home size={18} />
            {isGreek ? 'Αρχική Σελίδα' : 'Back to Home'}
          </Link>
          <a
            href="mailto:hermanosrentals@gmail.com"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Mail size={18} />
            {isGreek ? 'Επικοινωνία' : 'Contact us'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
