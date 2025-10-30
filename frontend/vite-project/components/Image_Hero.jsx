import { useState, useRef } from 'react'

export default function Image_Hero(){
    const [quality, setQuality] = useState(50)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [height, setHeight] = useState('')
    const [width, setWidth] = useState('')
    const [format, setFormat] = useState('jpeg')
    const [rotation, setRotation] = useState('')
    const [loading, setLoading] = useState(false)
    const [processedImageUrl, setProcessedImageUrl] = useState(null)
    const [imageError, setImageError] = useState(false)
    const fileInputRef = useRef(null)

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Handle image upload area click
    const handleUploadAreaClick = () => {
        fileInputRef.current?.click()
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!imageFile) {
            alert('Please upload an image first')
            return
        }

        setLoading(true)
        setProcessedImageUrl(null) // Clear previous result
        setImageError(false) // Reset error state
        
        try {
            const formData = new FormData()
            formData.append('image', imageFile)
            formData.append('height', height)
            formData.append('width', width)
            formData.append('format', format)
            formData.append('rotation', rotation)
            formData.append('quality', quality)

            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()
            
            if (response.ok) {
                console.log('Success:', data)
                // Store the processed image URL
                setProcessedImageUrl(data.fileUrl)
            } else {
                alert('Error: ' + data.error)
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Failed to upload image')
        } finally {
            setLoading(false)
        }
    }

    // Download processed image
    const downloadImage = async () => {
        if (!processedImageUrl) return;
        
        try {
            // Fetch the image as a blob
            const response = await fetch(processedImageUrl, {
                method: 'GET',
            });
            
            if (!response.ok) {
                throw new Error('Failed to download image');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link element to trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `transformed-image.${format}`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image. Please try the "Open in New Tab" button instead.');
        }
    }

    return(
        <>
         <div className='min-h-screen bg-zinc-900 p-6 '>
         <div className=' mx-auto space-y-6 '>
             <div className='bg-gray-100 flex flex-col max-w-4xl justify-between ml-72  p-4 rounded-2xl min-h-[600px]'>
            <div className='h-[250px] flex items-center gap-18 w-full '>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div 
                    onClick={handleUploadAreaClick}
                    className='hover:cursor-pointer bg-gray-300 w-[400px] h-full flex items-center justify-center text-xl rounded-lg border-2 border-dashed border-gray-400'>
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                        'Upload Your Image Here!'
                    )}
                </div>
                <button 
                    onClick={handleUploadAreaClick}
                    className='bg-blue-500 text-white rounded-2xl px-6 py-4 font-semibold hover:bg-blue-800 cursor-pointer transition-colors duration-200'>
                    Upload Image
                </button>
            </div>

            <div className=' h-[310px] flex flex-col'>
              <div className='flex h-[62px] gap-12 items-center'>
                <input 
                    placeholder='Height' 
                    type='number'   
                    min="0"  
                    max="1000"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className='w-[140px] p-2 bg-gray-300 border-2 border-black text-center' 
                />
                <input 
                    placeholder='Width' 
                    type='number'  
                    min="0" 
                    max="1000" 
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className='w-[140px] p-2 bg-gray-300 border-2 border-black text-center' 
                />
                <p>Resize Images(H X W)</p>
              </div>

              <div className='flex h-[62px] gap-12 items-center'>
                <select 
                    name='format' 
                    id='format' 
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-[140px] p-2 bg-gray-300 border-black text-center"
                >
                  <option value='jpeg'>JPEG</option>
                  <option value='jpg'>JPG</option>
                  <option value='png'>PNG</option>
                  <option value='webp'>WebP</option>
                </select>
                <p>Change Image Format</p>
              </div>

              <div className='flex h-[62px] gap-12 items-center'>
                <button 
                    type="button"
                    onClick={() => setRotation('left')}
                    className={`rounded-sm p-2 hover:cursor-pointer ${rotation === 'left' ? 'bg-gray-500' : 'bg-gray-300'} hover:bg-gray-500`}
                >
                    Left
                </button>
                <button 
                    type="button"
                    onClick={() => setRotation('right')}
                    className={`rounded-sm p-2 hover:cursor-pointer ${rotation === 'right' ? 'bg-gray-500' : 'bg-gray-300'} hover:bg-gray-500`}
                >
                    Right
                </button>
                <p>Rotate Images</p>
              </div>

              <div className='flex h-[62px] gap-12 items-center'>
                <input 
                    type='range' 
                    value={quality} 
                    min="0" 
                    max='100' 
                    onChange={(e) => setQuality(e.target.value)} 
                    className='hover:cursor-pointer' 
                />
                <p>{quality}%</p>
                <p>Set Quality</p>
              </div>

              <div className='flex h-[62px]  items-center justify-center'>
                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`font-semibold cursor-pointer p-4 rounded-xl transition-colors ${
                        loading 
                            ? 'bg-gray-500 cursor-not-allowed' 
                            : 'bg-black text-white hover:bg-gray-800'
                    }`}
                >
                    {loading ? 'Processing...' : 'Generate'}
                </button>
              </div>
              

            </div>

            {/* Display Processed Image */}
            {processedImageUrl && (
                <div className='mt-6 border-t-2 border-gray-300 pt-6'>
                    <div className='flex flex-col items-center gap-4'>
                        <h2 className='text-2xl font-bold text-gray-800'>Transformed Image</h2>
                        <div className='w-full max-w-2xl bg-white rounded-lg p-4 shadow-lg'>
                            {!imageError ? (
                                <img 
                                    src={processedImageUrl} 
                                    alt="Processed" 
                                    className='w-full h-auto rounded-lg'
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className='bg-gray-200 rounded-lg p-8 text-center'>
                                    <p className='text-gray-600 mb-4'>Unable to display image directly</p>
                                    <a 
                                        href={processedImageUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className='text-blue-600 hover:underline'
                                    >
                                        Click to open image in new tab
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className='flex gap-4'>
                            <button
                                onClick={downloadImage}
                                className='bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors'
                            >
                                Download Image
                            </button>
                            <a
                                href={processedImageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
                            >
                                Open in New Tab
                            </a>
                        </div>
                    </div>
                </div>
            )}

          </div>
          </div>

          </div>
        </>
    )
}