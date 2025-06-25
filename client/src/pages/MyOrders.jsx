import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import PopupBanner from '../components/CofirmBox'
import { useNavigate } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'

const MyOrders = (props) => {
  const orders = useSelector(state => state.orders.order)
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const navigate = useNavigate()

  console.log("order Items",orders)

  const fetchOrders = async () => {
    try {
      // ... existing code ...
    } catch (error) {
      if (error?.response?.data?.message === 'Provide token') {
        setShowAuthPopup(true)
      }
      AxiosToastError(error)
    }
  }

  return (
    <>
      {showAuthPopup && (
        <PopupBanner
          message="Please login or register to view your orders."
          onLogin={() => { setShowAuthPopup(false); navigate('/login') }}
          onRegister={() => { setShowAuthPopup(false); navigate('/register') }}
          onClose={() => setShowAuthPopup(false)}
        />
      )}
      <div>
        <div className='bg-white shadow-md p-3 font-semibold'>
          <h1>Order</h1>
        </div>
        {
          !orders[0] && (
            <NoData/>
          )
        }
        {
          orders.map((order,index)=>{
            return(
              <div key={order._id+index+"order"} className='order rounded p-4 text-sm'>
                  <p>Order No : {order?.orderId}</p>
                  <div className='flex gap-3'>
                    <img
                      src={order.product_details.image[0]} 
                      className='w-14 h-14'
                    />  
                    <p className='font-medium'>{order.product_details.name}</p>
                  </div>
              </div>
            )
          })
        }
      </div>
    </>
  )
}

export default MyOrders
