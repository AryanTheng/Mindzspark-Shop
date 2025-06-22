import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, createRazorpayOrder, getOrderDetailsController, handleWebhook, paymentController, verifyRazorpayPayment } from '../controllers/order.controller.js'
import razorpay from '../config/razorpay.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/create-razorpay-order',auth,createRazorpayOrder)
orderRouter.post('/verify-razorpay-payment',auth,verifyRazorpayPayment)
orderRouter.post('/web-hook',auth,handleWebhook)
orderRouter.get("/order-list",auth,getOrderDetailsController)

// Add Razorpay order creation endpoint stub
// router.post('/create-razorpay-order', async (req, res) => {
//   // Razorpay order creation logic here
// });

export default orderRouter