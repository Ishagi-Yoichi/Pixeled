export default function Header(){
    return(
        <>
        
             <div className=' flex items-center justify-between p-2  border-b-2 border-gray-800 '>
            <div className='flex flex-col items-center'>
              <h1 className='text-4xl text-white font-serif font-bold'>Pixeled</h1>
              <p>Image Processing Service</p>
            </div>
            <button className='flex font-semibold mb-6.5 bg-blue-500 text-white cursor-pointer rounded-2xl p-3 hover:bg-blue-800 '>Get Started</button>
          
          </div>
        </>
    )
}