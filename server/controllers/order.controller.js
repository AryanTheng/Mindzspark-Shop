import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import razorpay from '../config/razorpay.js';

export async function CashOnDeliveryOrderController(request,response){
    try {
        
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export async function createRazorpayOrder(req, res){
    try {
        const userId = req.userId // auth middleware 
        const {list_items, totalAmt, addressId, subTotalAmt, currency, receipt, notes} = req.body;
        if(!totalAmt || !subTotalAmt){
            return res.status(400).json({ success:false, message:"Missing required fields"});
        }

        const options = {
            amount: totalAmt*100,
            currency,
            receipt,
            notes
        }
        const order = await razorpay.orders.create(options);
        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : order.id,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "ORDER CREATED AT RAZORPAY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })
        const generatedOrder = await OrderModel.insertMany(payload)
        return res.status(200).json({success:true, order});
    } catch (error) {
        console.log("Error in createRazorpayOrder:", error);
        return res.status(400).json({success:false, message:"Unable to create order, Please try again Later."})        
    }
}

export async function verifyRazorpayPayment(req, res){
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
            return res.status(400).json({success:false, message:"Missing Payment Info."});
        }
        console.log("working")
        const generatedSignature = crypto
              .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
              .update(`${razorpay_order_id}|${razorpay_payment_id}`)
              .digest('hex');
        
        if(generatedSignature != razorpay_signature){
            return res.status(400).json({success:false, message:"Invalid Signature."})
        }
        const order = await OrderModel.findOne({ razorpay_order_id });
        order.payment_status = "PAID";
        order.paymentId = razorpay_payment_id;
        order.updatedAt = new Date();
        await order.save();
        
        return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } catch (error) {
        console.error("Error in verifyPayment:", error);
        return res.status(500).json({ success: false, message: 'Server Error', error });
    }
}

export const handleWebhook = (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('Webhook verified successfully');
    return res.status(200).json({ status: 'ok' });
  } else {
    return res.status(400).json({ status: 'invalid signature' });
  }
};

export async function paymentController(request,response){
    try {
        // Razorpay order creation logic stub
        // Example:
        // const options = {
        //   amount: totalAmt * 100, // amount in smallest currency unit
        //   currency: 'INR',
        //   receipt: 'order_rcptid_11',
        // };
        // const order = await razorpay.orders.create(options);
        // return response.status(200).json(order);
        response.status(501).json({ message: 'Razorpay integration pending', success: false });
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
