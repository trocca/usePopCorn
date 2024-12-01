import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// import StarRating from './StarRating'

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Center aligns horizontally
  gap: '1rem', // Adds spacing between items
};

const textStyle = {
  marginTop: '0.5rem',
  fontSize: '16px',
  color: '#333',
};




// const Test = () => {
//   const [movieRating, setMovieRating] = useState(0);

//   return (
//     <div style={containerStyle}>
//       <StarRating color="blue" maxRating={10} onRating={setMovieRating} />
//       <p style={textStyle}>This movie&apos;s rating is: {movieRating}</p>
//     </div>
//   );
// };

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <StarRating maxRating={5} size = {24} ratingText = {['Horrible', 'Decent','Ok...', 'Worth watching',  'Exceptional!']} />
    <StarRating maxRating={10} color="#f39c12" size={64} />
    <Test /> */}
  </StrictMode>,
)
