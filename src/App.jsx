import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import './App.css'

function App() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [activeTab, setActiveTab] = useState('preset') // 'preset' atau 'slider'
  const [selectedPreset, setSelectedPreset] = useState('kilat') // default preset
  const [customCompression, setCustomCompression] = useState(50)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressedFiles, setCompressedFiles] = useState([])
  const MIN_IMAGE_SIZE = 50 * 1024; // 50 KB

  // Preset mapping
  const presetOptions = [
    { key: 'drastis', label: 'Drastis (Kompresi 80%)', percent: 80 },
    { key: 'normal', label: 'Normal (Kompresi 60%)', percent: 60 },
    { key: 'sedikit', label: 'Sedikit (Kompresi 20%)', percent: 20 },
  ]

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      (file.name.toLowerCase().endsWith('.jpg') || 
       file.name.toLowerCase().endsWith('.jpeg') || 
       file.name.toLowerCase().endsWith('.png'))
    )
    setSelectedFiles(imageFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      originalSize: file.size
    })))
  }

  const getCompressionOptions = (compressionPercent) => {
    // Hanya gunakan parameter quality sesuai preset
    const quality = 1 - (compressionPercent / 100)
    return {
      useWebWorker: true,
      quality: quality
    }
  }

  const handleCompress = async () => {
    // Validasi ukuran file
    const tooSmall = selectedFiles.some(item => item.originalSize < MIN_IMAGE_SIZE)
    if (tooSmall) {
      alert('Ukuran file gambar minimal yang bisa dikompres adalah 50 KB.')
      return
    }
    setIsCompressing(true)
    try {
      let compressionPercent = 50
      if (activeTab === 'preset') {
        const preset = presetOptions.find(p => p.key === selectedPreset)
        compressionPercent = preset ? preset.percent : 50
      } else {
        compressionPercent = customCompression
      }
      const compressedResults = await Promise.all(
        selectedFiles.map(async (item) => {
          const options = getCompressionOptions(compressionPercent)
          const compressedFile = await imageCompression(item.file, options)
          return {
            ...item,
            compressedFile,
            compressedSize: compressedFile.size,
            downloadUrl: URL.createObjectURL(compressedFile)
          }
        })
      )
      setCompressedFiles(compressedResults)
    } catch (error) {
      console.error('Error compressing images:', error)
      alert('Terjadi kesalahan saat mengompres gambar. Silakan coba lagi.')
    } finally {
      setIsCompressing(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Kompresin</h1>
        <p>Aplikasi Kompresi Gambar Online</p>
      </header>

      <main className="main">
        <div className="upload-section">
          <h2>Pilih Gambar</h2>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            className="file-input"
          />
          <p className="file-info">
            Format yang didukung: JPG, JPEG, PNG
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="compression-section">
            <div className="tab-group">
              <button
                className={activeTab === 'preset' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('preset')}
              >
                Preset
              </button>
              <button
                className={activeTab === 'slider' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('slider')}
              >
                Slider
              </button>
            </div>

            {activeTab === 'preset' && (
              <div className="preset-section">
                <div className="preset-options">
                  {presetOptions.map((preset) => (
                    <button
                      key={preset.key}
                      className={selectedPreset === preset.key ? 'preset-btn active' : 'preset-btn'}
                      onClick={() => setSelectedPreset(preset.key)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'slider' && (
              <div className="custom-section">
                <label>Target Kompresi: {customCompression}%</label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={customCompression}
                  onChange={(e) => setCustomCompression(parseInt(e.target.value))}
                  className="slider"
                />
              </div>
            )}

            <button 
              onClick={handleCompress}
              disabled={isCompressing}
              className="compress-btn"
            >
              {isCompressing ? 'Mengompres...' : 'Kompres'}
            </button>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="files-section">
            <h2>File yang Dipilih</h2>
            {selectedFiles.map((item) => (
              <div key={item.id} className="file-item">
                <span>{item.file.name}</span>
                <span>{formatFileSize(item.originalSize)}</span>
              </div>
            ))}
          </div>
        )}

        {compressedFiles.length > 0 && (
          <div className="results-section">
            <h2>Hasil Kompresi</h2>
            {compressedFiles.map((item) => (
              <div key={item.id} className="result-item">
                <span>{item.file.name}</span>
                <span>{formatFileSize(item.compressedSize)}</span>
                <span className="reduction">
                  -{Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100)}%
                </span>
                <a 
                  href={item.downloadUrl} 
                  download={item.file.name}
                  className="download-btn"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Dibuat oleh Bima - Teknologi Multimedia 4TIF C</p>
      </footer>
    </div>
  )
}

export default App
