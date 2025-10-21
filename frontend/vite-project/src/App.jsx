
import './App.css'

function App() {
  

  return (
    <>
      <div className='min-h-screen bg-gray-300 p-6'>
        <div className='max-w-4xl mx-auto space-y-6 '>
          
          {/*Header*/}
          <div className=' flex items-center justify-between p-4 mt-8 border-b-2 border-gray-400 '>
            <div className='flex flex-col items-center'>
              <h1 className='text-4xl font-bold'>Pixeled</h1>
              <p>Image Processing Service</p>
            </div>
            <button className='flex font-semibold bg-blue-500 text-white cursor-pointer rounded-2xl p-3 hover:bg-blue-800 '>Get Started</button>
          </div>

          {/*Hero*/}
          <div className='bg-white flex flex-col  justify-between p-4 rounded-2xl h-[600px]'>
            <div className='h-[250px] flex items-center gap-18 w-full'>
                <div className='bg-gray-300 w-[400px] h-full flex items-center justify-center text-xl rounded-lg border-2 border-dashed border-gray-400'>
                  Upload Your Image Here!
                </div>
                <button className='bg-blue-500 text-white rounded-2xl px-6 py-4 font-semibold hover:bg-blue-800 cursor-pointer transition-colors duration-200'>
                  Upload Image
                </button>
            </div>

            <div className=' h-[310px] flex flex-col'>
              <div className='flex h-[62px] gap-12 items-center'>
                <input placeholder='Enter Pixels' type='number' value="0"  min="0"  max="100 "className='bg-gray-300 border-2 border-black text-center' />
                <input placeholder='Enter Pixels' type='number' value="0" min={0} max={100} className='bg-gray-300 border-2 border-black text-center' />
                <p>Resize Images(H X W)</p>
              </div>

              <div className='flex h-[62px] gap-12 items-center'>
                <input placeholder='Enter Pixels' type='number' value="0" className='bg-gray-300 border-2 border-black text-center' />
                <p>Crop Images</p>
              </div>

              <div className='flex h-[62px] gap-12 items-center'>
                <button className='bg-gray-300 rounded-sm p-2'>Left</button>
                <button className='bg-gray-300 rounded-sm p-2'>Right</button>
                <p>Rotate Images</p>
              </div>

              <div className='flex h-[62px] gap-12 items-center'>
                <input placeholder='Enter Pixels' type='number' value="0" className='bg-gray-300 border-2 border-black text-center' />
                <p>Enter Pixels</p>
              </div>

              <div className='flex h-[62px]  items-center justify-center'>
                <button className='bg-black text-white font-semibold cursor-pointer p-4 rounded-xl hover:bg-gray-800'>Generate</button>
              </div>
              

            </div>
            

            

          </div>

        </div>

      </div>
    </>
  )
}

export default App
