import React, { useEffect, useState } from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link, useNavigate } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import toast from 'react-hot-toast'
import { useGlobalContext } from '../provider/GlobalProvider'
import AddToCartButton from './AddToCartButton'
import PopupBanner from './CofirmBox'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const CardProduct = ({data}) => {
    const url = `/product/${valideURLConvert(data.name)}-${data._id}`
    const [loading,setLoading] = useState(false)
    const navigate = useNavigate();
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);

    // Check if product is in wishlist on mount (optional: can be improved with global state)
    useEffect(() => {
      // Optionally fetch wishlist status from API or props
      // For now, default to false
      setInWishlist(false);
    }, [data._id]);

    const handleBuyNow = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Redirect to checkout page with product id (customize as needed)
      navigate(`/checkout?productId=${data._id}`);
    }

    const handleSomeAction = async () => {
      try {
        // ... existing code ...
      } catch (error) {
        if (error?.response?.data?.message === 'Provide token') {
          setShowAuthPopup(true);
        }
        AxiosToastError(error);
      }
    };

    const handleWishlist = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (wishlistLoading) return;
      setWishlistLoading(true);
      try {
        if (!inWishlist) {
          await Axios({
            ...SummaryApi.addToWishlist,
            data: { productId: data._id },
          });
          setInWishlist(true);
          toast.success('Added to wishlist');
        } else {
          await Axios({
            ...SummaryApi.removeFromWishlist,
            data: { productId: data._id },
          });
          setInWishlist(false);
          toast.success('Removed from wishlist');
        }
      } catch (error) {
        if (error?.response?.data?.message === 'Provide token') {
          setShowAuthPopup(true);
        }
        AxiosToastError(error);
      } finally {
        setWishlistLoading(false);
      }
    };

  return (
    <>
      {showAuthPopup && (
        <PopupBanner
          message="You need to login or register to continue."
          onLogin={() => { setShowAuthPopup(false); navigate('/login'); }}
          onRegister={() => { setShowAuthPopup(false); navigate('/register'); }}
          onClose={() => setShowAuthPopup(false)}
        />
      )}
      <Link to={url} className='border py-2 lg:p-4 grid gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-white' >
        <div className='min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden relative'>
              <img 
                  src={data.image[0]}
                  className='w-full h-full object-scale-down lg:scale-125'
              />
              {/* Wishlist Heart Icon */}
              <button
                className='absolute top-2 right-2 z-10 text-xl text-red-500 bg-white rounded-full p-1 shadow'
                onClick={handleWishlist}
                disabled={wishlistLoading}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {inWishlist ? <FaHeart /> : <FaRegHeart />}
              </button>
        </div>
        <div className='flex items-center gap-1'>
          <div className='rounded text-xs w-fit p-[1px] px-2 text-green-600 bg-green-50'>
                10 min 
          </div>
          <div>
              {
                Boolean(data.discount) && (
                  <p className='text-green-600 bg-green-100 px-2 w-fit text-xs rounded-full'>{data.discount}% discount</p>
                )
              }
          </div>
        </div>
        <div className='px-2 lg:px-0 font-medium text-ellipsis text-sm lg:text-base line-clamp-2'>
          {data.name}
        </div>
        <div className='w-fit gap-1 px-2 lg:px-0 text-sm lg:text-base'>
          {data.unit} 
          
        </div>

        <div className='px-2 lg:px-0 flex items-center justify-between gap-1 lg:gap-3 text-sm lg:text-base'>
          <div className='flex items-center gap-1'>
            <div className='font-semibold'>
                {DisplayPriceInRupees(pricewithDiscount(data.price,data.discount))} 
            </div>
            
            
          </div>
          <div className='flex flex-col sm:flex-row gap-2 w-full'>
            {
              data.stock == 0 ? (
                <p className='text-red-500 text-sm text-center w-full'>Out of stock</p>
              ) : (
                <>
                  <AddToCartButton data={data} buttonClassName='flex-1' />
                </>
              )
            }
              
          </div>
        </div>

      </Link>
    </>
  )
}

export default CardProduct
