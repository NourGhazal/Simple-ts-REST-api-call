import request from 'request';
const maxPrice = 100000;
const minPrice = 0;
let total = 0;
const products = [];
const getProducts = (currentMaxPrice: number, currentMinPrice: number) => {
  const url = `https://api.ecommerce.com/products?maxPrice=${currentMaxPrice}&minPrice=${currentMinPrice}`;
  request({
    uri: url,
    callback: function (error, response, body) {
      if (!error && response.statusCode === 200) {
        body = JSON.parse(body);
        const count: number = body.count;
        const currentTotal = body.total;
        //total number of products is the total returned when we query for the max possible price and min possible price
        if (currentMaxPrice === maxPrice && currentMinPrice === minPrice) {
          total = currentTotal;
        }
        //Return  when you get all products
        //or when the minimum price is greater than the maximum price to handle the special case mentioned below
        if (
          (total > 0 && total == products.length) ||
          currentMinPrice > maxPrice
        ) {
          return;
        }
        // we add the returned products to the products array in case the total number of products is equal to the count of returned products
        //We preform this check instead of a limit check on 1000 products to handle the case there was a change in the limit
        if (currentTotal <= count) {
          const fetchedProducts = body.products;
          products.push(fetchedProducts);
          //After pushing the products we now need to continue our search for the rest of the products
          //We set Our Current minimum price to the current max price + 1 to make sure we don't get the same products again
          currentMinPrice = currentMaxPrice + 1;
          //We set our Current maximum price to be half the way between our new Current minimum price and the max price to mimic the binary search algorithm
          currentMaxPrice = Math.floor((currentMinPrice + maxPrice) / 2);
          //We preform a recursive call to get the rest of the products with our updated min and max prices
          getProducts(currentMaxPrice, currentMinPrice);
        } else {
          //this is to handle a situation where the count of products with the same  price is already more than the limit
          //in that case we will have to treat it as if the total was equal to the count as we cannot shrink the range more than this
          if (currentMaxPrice == currentMinPrice) {
            const fetchedProducts = body.products;
            products.push(fetchedProducts);
            currentMinPrice = currentMaxPrice + 1;
            currentMaxPrice = Math.floor((currentMinPrice + maxPrice) / 2);
            getProducts(currentMaxPrice, currentMinPrice);
          }
          //In case the total number of products is not equal to the count of returned products we know that we need to shrink our range of prices
          //We do that by setting our new maximum price to be half the way between our current maximum price and the current minimum price just like in the binary search algorithm
          currentMaxPrice = Math.floor((currentMinPrice + currentMinPrice) / 2);
          getProducts(currentMaxPrice, currentMinPrice);
        }
      }
    },
  });
};

getProducts(maxPrice, 0);
