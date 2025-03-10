import { useState } from 'react';
import { motion } from 'framer-motion';

const CategoryBar = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-md rounded-lg mb-8 overflow-x-auto">
      <div className="flex p-2 min-w-max">
        <button
          onClick={() => setActiveCategory('Todos')}
          className={`px-6 py-3 mx-2 rounded-md transition-all duration-300 relative ${
            activeCategory === 'Todos'
              ? 'text-white font-medium'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {activeCategory === 'Todos' && (
            <motion.div
              layoutId="categoryIndicator"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          Todos
        </button>

        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-3 mx-2 rounded-md transition-all duration-300 relative ${
              activeCategory === category
                ? 'text-white font-medium'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {activeCategory === category && (
              <motion.div
                layoutId="categoryIndicator"
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
