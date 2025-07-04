import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, createRazorpayOrder, getOrderDetailsController, handleWebhook, paymentController, verifyRazorpayPayment, addOrderStatusUpdate, backfillOrderDeliveryAddresses, getAllOrdersController, getTodayOrdersController } from '../controllers/order.controller.js'
import razorpay from '../config/razorpay.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/create-razorpay-order',auth,createRazorpayOrder)
orderRouter.post('/verify-razorpay-payment',auth,verifyRazorpayPayment)
orderRouter.post('/web-hook',auth,handleWebhook)
orderRouter.post('/add-status-update', auth, addOrderStatusUpdate)
orderRouter.post('/backfill-delivery-addresses', auth, backfillOrderDeliveryAddresses)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get('/all-orders', auth, getAllOrdersController)
orderRouter.get('/today-orders', auth, getTodayOrdersController)

// Add Razorpay order creation endpoint stub
// router.post('/create-razorpay-order', async (req, res) => {
//   // Razorpay order creation logic here
// });

export default orderRouter