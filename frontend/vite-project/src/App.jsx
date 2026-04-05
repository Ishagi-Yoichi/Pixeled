import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "../components/Header";
import Image_Hero from "../components/Image_Hero";
import Hero from "../components/Hero";
import VideoArena from "../components/VideoArena";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className=" min-h-screen bg-linear-to-br flex justify-center from-gray-950 from-70%  to-blue-950 ">
                  <div className="relative max-h-[100vh] max-w-7xl">
                    <div className="absolute left-0 w-px h-screen bg-linear-to-t from-neutral-800 via-neutral-400 to-neutral-900" />
                    <div className="absolute right-0 w-px h-screen bg-linear-to-t from-neutral-800 via-neutral-400 to-neutral-900" />
                    <Header />
                    <Hero />
                  </div>
                </div>
              </>
            }
          />
          <Route path="/image" element={<Image_Hero />} />
          <Route path="/video" element={<VideoArena />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
