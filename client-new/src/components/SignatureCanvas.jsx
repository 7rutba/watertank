import React, { useRef, useEffect, useState } from 'react';

const SignatureCanvas = ({ onSignatureChange, width = 400, height = 200 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Set canvas size
    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      // Touch event
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
    
    // Notify parent component
    if (onSignatureChange) {
      const signatureData = canvasRef.current.toDataURL('image/png');
      onSignatureChange(signatureData);
    }
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      if (onSignatureChange) {
        const signatureData = canvasRef.current.toDataURL('image/png');
        onSignatureChange(signatureData);
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  return (
    <div className="signature-canvas-container">
      <div className="border-2 border-gray-300 rounded-lg bg-white" style={{ width: '100%', maxWidth: width }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none"
          style={{ height: height, display: 'block' }}
        />
      </div>
      <div className="mt-2 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {hasSignature ? 'Signature captured' : 'Sign above'}
        </p>
        <button
          type="button"
          onClick={clearSignature}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SignatureCanvas;

