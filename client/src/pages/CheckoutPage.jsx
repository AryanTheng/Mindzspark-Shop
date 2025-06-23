// All imports remain the same
import { useState, useEffect } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import AddAddress from '../components/AddAddress';
import { useSelector } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector(state => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector(state => state.cartItem.cart);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🛠️ Razorpay script loading...");
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      console.log("🧹 Razorpay script cleanup...");
      document.body.removeChild(script);
    };
  }, []);

  const handleCashOnDelivery = async () => {
    console.log("🧾 Initiating Cash on Delivery...");
    try {
      const payload = {
        list_items: cartItemsList,
        addressId: addressList[selectAddress]?._id,
        subTotalAmt: totalPrice,
        totalAmt: totalPrice,
      };
      console.log("📦 COD Payload:", payload);

      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: payload
      });

      const { data: responseData } = response;
      console.log("✅ COD API Response:", responseData);

      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem?.();
        fetchOrder?.();
        navigate('/success', { state: { text: "Order" } });
      } else {
        toast.error("COD failed. Please try again.");
      }

    } catch (error) {
      console.error("❌ COD Error:", error);
      AxiosToastError(error);
    }
  };

  const handleOnlinePayment = async () => {
    console.log("💳 Initiating Razorpay Payment...");
    try {
      const payload = {
        list_items: cartItemsList,
        addressId: addressList[selectAddress]?._id,
        subTotalAmt: totalPrice,
        totalAmt: totalPrice,
        currency: "INR",
        receipt: "receipt_" + Date.now(),
        notes: { note: "Order from frontend" }
      };
      console.log("🧾 Razorpay Order Payload:", payload);

      const response = await Axios({
        ...SummaryApi.createRazorpayOrder,
        data: payload
      });

      const { data: res } = response;
      console.log("🧾 Razorpay Order Response:", res);

      if (!res.success) {
        toast.error("Payment order failed");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: res.order.amount,
        currency: res.order.currency,
        name: "MindzSpark",
        description: "Payment for your order",
        image: logo,
        order_id: res.order.id,
        handler: async (response) => {
          console.log("🔁 Razorpay Handler Triggered:", response);

          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              addressId: addressList[selectAddress]?._id
            };
            console.log("🧾 Verification Payload:", verifyPayload);

            const verifyRes = await Axios({
              ...SummaryApi.verifyRazorpayPayment,
              data: verifyPayload
            });

            console.log("🔍 Payment Verification Response:", verifyRes.data);

            if (verifyRes.data.success) {
              toast.success("Payment successful!");
              fetchCartItem?.();
              fetchOrder?.();
              navigate('/success', { state: { text: "Order" } });
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error("❌ Verification Error:", err);
            AxiosToastError(err);
          }
        },
        theme: { color: "#3399cc" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("❌ Razorpay Init Error:", error);
      AxiosToastError(error);
    }
  };

  return (
    <section className='bg-blue-50'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        <div className='w-full'>
          <h3 className='text-lg font-semibold'>Choose your address</h3>
          <div className='bg-white p-2 grid gap-4'>
            {addressList.map((address, index) => (
              <label key={address._id || index} htmlFor={"address" + index} className={address.status ? "" : "hidden"}>
                <div className='border rounded p-3 flex gap-3 hover:bg-blue-50'>
                  <div>
                    <input
                      id={"address" + index}
                      type='radio'
                      value={index}
                      checked={selectAddress === index}
                      onChange={(e) => setSelectAddress(Number(e.target.value))}
                      name='address'
                    />
                  </div>
                  <div>
                    <p>{address.address_line}</p>
                    <p>{address.city}</p>
                    <p>{address.state}</p>
                    <p>{address.country} - {address.pincode}</p>
                    <p>{address.mobile}</p>
                  </div>
                </div>
              </label>
            ))}
            <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer'>
              Add address
            </div>
          </div>
        </div>

        <div className='w-full max-w-md bg-white py-4 px-2'>
          <h3 className='text-lg font-semibold'>Summary</h3>
          <div className='bg-white p-4'>
            <h3 className='font-semibold'>Bill details</h3>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Items total</p>
              <p className='flex items-center gap-2'>
                <span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                <span>{DisplayPriceInRupees(totalPrice)}</span>
              </p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Quantity total</p>
              <p>{totalQty} item(s)</p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Delivery Charge</p>
              <p>Free</p>
            </div>
            <div className='font-semibold flex items-center justify-between gap-4'>
              <p>Grand total</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
          </div>
          <div className='w-full flex flex-col gap-4'>
            <button className='py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white font-semibold' onClick={handleOnlinePayment}>Online Payment</button>
            <button className='py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white' onClick={handleCashOnDelivery}>Cash on Delivery</button>
          </div>
        </div>
      </div>

      {openAddress && (
        <AddAddress close={() => setOpenAddress(false)} />
      )}
    </section>
  );
};

export default CheckoutPage;
