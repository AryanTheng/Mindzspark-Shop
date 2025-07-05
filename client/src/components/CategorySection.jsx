import React from 'react';
import { Link } from 'react-router-dom';
import { valideURLConvert } from '../utils/valideURLConvert';

const CategorySection = ({ loadingCategory, categoryData, subCategoryData }) => {
  // Helper to get first subcategory for a category
  const getFirstSubCategory = (catId) => {
    return subCategoryData?.find(sub => sub.category.some(c => c._id === catId));
  };

  return (
    <div className="container mx-auto px-4 my-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
        {loadingCategory
          ? new Array(10).fill(null).map((_, index) => (
              <div key={index + 'loadingcategory'} className="flex flex-col items-center">
                <div className="bg-blue-100 rounded-full w-20 h-20 mb-2 animate-pulse" />
                <div className="bg-blue-100 h-4 w-16 rounded animate-pulse" />
              </div>
            ))
          : categoryData.map((cat) => {
              const sub = getFirstSubCategory(cat._id);
              let url = '#';
              if (sub) {
                url = `/${valideURLConvert(cat.name)}-${cat._id}/${valideURLConvert(sub.name)}-${sub._id}`;
              }
              return (
                <Link
                  key={cat._id + 'displayCategory'}
                  to={url}
                  className="flex flex-col items-center cursor-pointer group focus:outline-none"
                  tabIndex={0}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-2 bg-white rounded-full border border-gray-100 overflow-hidden group-hover:shadow-lg transition">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="object-contain w-16 h-16 md:w-20 md:h-20"
                      draggable="false"
                    />
                  </div>
                  <span className="text-center text-sm md:text-base font-medium text-gray-800 truncate w-20 md:w-24">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default CategorySection; 