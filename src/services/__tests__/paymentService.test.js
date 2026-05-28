// Tests for Razorpay integration in paymentService.js
import { initiatePremiumCheckout, loadRazorpayScript, PRICING } from '../paymentService';
import * as auth from '../../firebase/auth';
import { toast } from 'react-hot-toast';

jest.mock('../../firebase/auth');
jest.mock('react-hot-toast');

// Mock global window.Razorpay
let mockRazorpayOpen;
beforeEach(() => {
  mockRazorpayOpen = jest.fn();
  global.window = Object.create(window);
  Object.defineProperty(window, 'Razorpay', {
    value: jest.fn().mockImplementation(() => ({ open: mockRazorpayOpen })),
    writable: true,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('initiatePremiumCheckout loads script and opens Razorpay', async () => {
  // Mock loadRazorpayScript to resolve true
  jest.spyOn(require('../paymentService'), 'loadRazorpayScript').mockResolvedValue(true);

  const user = { uid: 'uid123', email: 'test@example.com' };
  const profile = { name: 'Test', points: 0 };
  const updateProfile = jest.fn();
  const onComplete = jest.fn();

  await initiatePremiumCheckout(user, profile, updateProfile, onComplete, 'monthly');

  expect(loadRazorpayScript).toHaveBeenCalled();
  expect(window.Razorpay).toHaveBeenCalledWith(expect.objectContaining({
    key: expect.any(String),
    amount: PRICING.monthly.amountPaise,
    currency: 'INR',
  }));
  expect(mockRazorpayOpen).toHaveBeenCalled();
  // toast.success is called inside handler; simulate handler call
  const handler = window.Razorpay.mock.calls[0][0].handler;
  await handler({ razorpay_payment_id: 'pay_123' });

  expect(auth.updateUserProfile).toHaveBeenCalledWith('uid123', expect.objectContaining({
    subscription: expect.objectContaining({ plan: 'paid' }),
  }));
  expect(updateProfile).toHaveBeenCalled();
  expect(onComplete).toHaveBeenCalled();
  expect(toast.success).toHaveBeenCalled();
});

test('initiatePremiumCheckout handles script load failure', async () => {
  jest.spyOn(require('../paymentService'), 'loadRazorpayScript').mockResolvedValue(false);
  const toastErrorSpy = jest.spyOn(toast, 'error');
  await initiatePremiumCheckout(null, null, jest.fn(), null);
  expect(toastErrorSpy).toHaveBeenCalled();
});
