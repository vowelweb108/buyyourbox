import React, { useState, useEffect } from 'react';
import './index.css';
import BundleDetails from './components/BundleDetails';
import ProductDetails from './components/ProductDetails';

function App() {
  const [data, setData] = useState([]);
  const [bundle, setBundle] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [selectedBunch, setSelectedBunch] = useState(null);
  const [totalSelectedProducts, setTotalSelectedProducts] = useState(0);
  const [error, setError] = useState(null);
  const [showProducts, setShowProducts] = useState(false);

  const fetchGraphQLData = async (productIds) => {
    try {
      const response = await fetch('https://um-charges-climate-austin.trycloudflare.com/api/fetchproductdetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }), // Send product IDs to the backend
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Product Details Result", result);
      
      // Assuming 'result.data' contains the product details
      setProductDetails(result.data);
    } catch (error) {
      setError('Failed to fetch product details');
      console.error('Error fetching product details:', error);
    }
  };
  
  
  const getdata = async () => {
    try {
      let response = await fetch('https://um-charges-climate-austin.trycloudflare.com/api/route/testing');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let res = await response.json();
      setData(res.data);

      const currentUrl = window.location.href;
      const handleInUrl = currentUrl.split('/').pop();

      const foundBundle = res.data.find(item => item.handle === handleInUrl);

      if (foundBundle) {
        setBundle(foundBundle);
        // Fetch product details for the selected bundle
        await fetchGraphQLData(foundBundle.products);
      }
    } catch (error) {
      setError('Failed to fetch bundle data');
      console.error('Error fetching bundle data:', error);
    }
  };

  const handleBunchChange = (bunch) => {
    setSelectedBunch(bunch);
    setTotalSelectedProducts(0); // Reset the cart when bunch is changed
  };

  const handleContinue = () => {
    setShowProducts(true);
  };

  const handleAddToCart = (productIndex) => {
    if (totalSelectedProducts < selectedBunch) {
      setTotalSelectedProducts(prevCount => prevCount + 1);
    }
    
    if (totalSelectedProducts + 1 >= selectedBunch) {
      alert('Your cart is full!');
    }
  };

  const handleClick = (i) => {
    const selectedBundle = data[i];
    const url = `https://greenchoice-flowers-subscriptions.myshopify.com/pages/testing-box-page/${selectedBundle.handle}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    getdata();
  }, []);

  return (
    <>
      <h1 className='heading'>Build Your Box</h1>
      <div className='container'>
        {showProducts ? (
          <ProductDetails
            products={productDetails}
            onAddToCart={handleAddToCart}
            totalSelectedProducts={totalSelectedProducts}
            maxProducts={selectedBunch}
          />
        ) : bundle ? (
          <BundleDetails
            bundle={bundle}
            selectedBunch={selectedBunch}
            onBunchChange={handleBunchChange}
            onContinue={handleContinue}
          />
        ) : (
          data.map((item, index) => (
            <div onClick={() => handleClick(index)} className="App" key={index}>
              <img src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))
        )}
      </div>
      {error && <div className="error">Error: {error}</div>}
    </>
  );
}

export default App;
