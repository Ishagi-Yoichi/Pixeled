
import './App.css'
import {BrowserRouter , Route , Routes} from 'react-router-dom';
import Header from '../components/Header'
import Image_Hero from '../components/Image_Hero';
import Hero from '../components/Hero';
import VideoConverter from '../components/VideoConverter';
function App() {
  

  return (
    <>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={ 
            <>
             <div className='min-h-screen bg-black p-6 '>
             <div className=' mx-auto space-y-6 '>
              <Header />
              <Hero />
              </div>
              </div>
            </>
          } />
          <Route path="/home" element={<Image_Hero />} />
          <Route path="/video" element={<VideoConverter />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
