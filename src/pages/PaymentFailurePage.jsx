import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RotateCcw, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Viva redirects here when a payment fails or is cancelled, e.g.
// /payment/failure?t=<transactionId>&s=<orderCode>&lang=el-GR&eventId=...
const PaymentFailurePage = () => {
  const { i18n } = useTranslation();
  const isGreek = i18n.language.startsWith('el');
  const [searchParams] = useSearchParams();

  const orderCode = searchParams.get('s');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-lg w-full p-8 md:p-10 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-600 w-11 h-11" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          {isGreek ? 'Η πληρωμή δεν ολοκληρώθηκε' : 'Payment Not Completed'}
        </h1>
        <p className="text-slate-600 mb-6">
          {isGreek
            ? 'Η πληρωμή ακυρώθηκε ή απορρίφθηκε και δεν έγινε καμία χρέωση στην κάρτα σας. Μπορείτε να δοκιμάσετε ξανά ή να επικοινωνήσετε μαζί μας.'
            : 'The payment was cancelled or declined and your card has not been charged. You can try again or contact us for help.'}
        </p>

        <ul className="text-left text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 space-y-1 list-disc pl-8">
          <li>{isGreek ? 'Ελέγξτε τα στοιχεία της κάρτας σας' : 'Check your card details'}</li>
          <li>{isGreek ? 'Βεβαιωθείτε ότι υπάρχει επαρκές υπόλοιπο' : 'Make sure you have sufficient funds'}</li>
          <li>{isGreek ? 'Δοκιμάστε άλλη κάρτα ή τρόπο πληρωμής' : 'Try another card or payment method'}</li>
        </ul>

        {orderCode && (
          <p className="text-xs text-slate-400 mb-6">
            {isGreek ? 'Κωδικός παραγγελίας' : 'Order code'}: <span className="font-mono">{orderCode}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/book"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <RotateCcw size={18} />
            {isGreek ? 'Δοκιμάστε ξανά' : 'Try again'}
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

export default PaymentFailurePage;
