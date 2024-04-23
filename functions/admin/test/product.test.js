const { getAllProducts } = require('../service/productService'); 

describe('Getting all products', () => {
  it('should return a list of products for clients', async () => {
    const products = await getAllProducts();
    expect(Array.isArray(products)).toBe(true);
  });
});
