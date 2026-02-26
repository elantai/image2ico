'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, Download, Settings, RefreshCw, CheckCircle2 } from 'lucide-react';
import { convertToIco } from '@/lib/ico-converter';
import { motion, AnimatePresence } from 'motion/react';

const AVAILABLE_SIZES = [16, 32, 48, 64, 128, 256];

export default function IcoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48, 64, 128, 256]);
  const [isConverting, setIsConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResultUrl(null);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const toggleSize = (size: number) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size].sort((a, b) => a - b)
    );
  };

  const handleConvert = async () => {
    if (!file || selectedSizes.length === 0) return;
    
    setIsConverting(true);
    try {
      const blob = await convertToIco(file, selectedSizes);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Failed to convert image. Please try another one.');
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4 text-indigo-600"
          >
            <ImageIcon className="w-8 h-8" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl mb-4"
          >
            Image to ICO Converter
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            Create high-quality favicon.ico files from your images. Works entirely in your browser.
          </motion.p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
            
            {/* Left Column: Upload & Preview */}
            <div className="p-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-neutral-400" />
                Source Image
              </h2>
              
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
                      ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-300 hover:border-indigo-400 hover:bg-neutral-50'}
                    `}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      className="hidden"
                    />
                    <div className="mx-auto w-16 h-16 mb-4 bg-white rounded-full shadow-sm border border-neutral-100 flex items-center justify-center text-neutral-400">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium text-neutral-900 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-neutral-500">PNG, JPG, WEBP or SVG (max. 10MB)</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative rounded-2xl border border-neutral-200 bg-neutral-50 p-4 aspect-square flex flex-col items-center justify-center overflow-hidden group"
                  >
                    <img 
                      src={previewUrl!} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain drop-shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); reset(); }}
                        className="bg-white text-neutral-900 px-4 py-2 rounded-full font-medium text-sm shadow-lg hover:bg-neutral-100 transition-colors"
                      >
                        Change Image
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Settings & Action */}
            <div className="p-8 bg-neutral-50/50 flex flex-col">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-neutral-400" />
                Icon Settings
              </h2>
              
              <div className="mb-8 flex-grow">
                <p className="text-sm text-neutral-600 mb-3">Include sizes (px):</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map(size => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                          ${isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50'
                          }
                        `}
                      >
                        {size}×{size}
                      </button>
                    );
                  })}
                </div>
                {selectedSizes.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">Please select at least one size.</p>
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleConvert}
                  disabled={!file || selectedSizes.length === 0 || isConverting}
                  className={`
                    w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center transition-all
                    ${(!file || selectedSizes.length === 0) 
                      ? 'bg-neutral-300 cursor-not-allowed' 
                      : isConverting
                        ? 'bg-indigo-500 cursor-wait'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]'
                    }
                  `}
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Convert to ICO
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {resultUrl && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <a
                        href={resultUrl}
                        download="favicon.ico"
                        className="w-full py-3 px-4 rounded-xl font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-colors border border-indigo-200 mt-4"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download favicon.ico
                      </a>
                      <p className="text-center text-xs text-green-600 mt-2 flex items-center justify-center font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Conversion successful!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>All processing happens locally in your browser. No images are uploaded to any server.</p>
        </div>
      </div>
    </div>
  );
}
