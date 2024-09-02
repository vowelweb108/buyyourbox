import { useState, useEffect } from 'react';
import './index.css';
import ProductScroller from './components/ProductScroller';
function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const getdata = async () => {
   let data= await fetch(`https://prize-met-teach-delivers.trycloudflare.com/api/route/testing`);

    if (!data.ok) {
      throw new Error(`HTTP error! status: ${data.status}`);
    }
    let res = await data.json();
    // console.log("res", res);
    setData(res.data);

    // console.log("COMING FROM APP hiiiiiiii")
  };

  const handleClick=(i)=>{

//  console.log(data[i].handle)
 return window.open(`https://greenchoice-flowers-subscriptions.myshopify.com/pages/testing-box-page/${data[i].handle}`, '_blank');
  }

  useEffect(() => {
    getdata();
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <>
    <h1 className='heading'>Build Your Box</h1>
    <div className='container'>
      
    {
        data.map((item, index) => (
          <div onClick={()=>handleClick(index)} className="App" key={index}>
            
            <img src={item.image} alt={item.title} />
            <h3>{item.title}</h3>
          </div>
        ))
      }
    </div>
   
    </>
  );
}

export default App;





// console.log("COMING FROM APP hiiiiiiii")

// const getdata = async () => {
//   try {
//     let response = await fetch(`https://prize-met-teach-delivers.trycloudflare.com/api/route/testing`);
//     console.log("response", response);

//     let res = await response.json();
//     console.log("res", res);

//     let str = "";

//     if (res.status == 200) {
//       for (let i = 0; i < res.data.length; i++) {
//         console.log("SAVE", res.data[i]);
//         str += `<button onclick="window.open(https://greenchoice-flowers-subscriptions.myshopify.com/pages/testing-box-page/${res.data[i].handle}, '_blank')">${res.data[i].handle}</button>`;
//       }

//       document.getElementById("BuildBox").innerHTML = str;
//     }


//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// };

// getdata();
