import React, { useEffect, useRef, useState } from 'react';
import { socketService } from '../../services/examCollabService';

const Whiteboard = ({ roomId, isAdmin, username, drawingPermissions }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(2);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tool, setTool] = useState('pen'); // pen, circle, square
  const [drawingShape, setDrawingShape] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  
  const canDraw = isAdmin || drawingPermissions.includes(username);

  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setContext(ctx);
  }, [color, lineWidth]);

  // Handle drawing data and subscriptions
  useEffect(() => {
    if (!context || !canvasRef.current) return;

    const loadDrawing = (drawingData) => {
      const image = new Image();
      image.onload = () => {
        if (context && canvasRef.current) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          context.drawImage(image, 0, 0);
        }
      };
      image.src = drawingData;
    };

    // Request existing drawing data
    socketService.requestDrawingData(roomId);

    // Subscribe to drawing updates
    socketService.subscribeToDrawingData(({ drawingData }) => {
      if (drawingData && !isInitialized) {
        loadDrawing(drawingData);
        setIsInitialized(true);
      }
    });

    // Subscribe to real-time drawing actions
    socketService.subscribeToDrawingAction((data) => {
      if (data.roomId === roomId) {
        if (data.clear) {
          clearCanvas();
        } else {
          drawLine(data);
        }
      }
    });

    return () => {
      socketService.unsubscribeFromDrawingAction();
    };
  }, [roomId, context, isInitialized]);

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const drawLine = (data) => {
    if (!context) return;
    context.beginPath();
    context.strokeStyle = data.color;
    context.lineWidth = data.lineWidth;
    context.moveTo(data.x0, data.y0);
    context.lineTo(data.x1, data.y1);
    context.stroke();
  };

  const saveDrawing = () => {
    if (!canvasRef.current) return;
    const drawingData = canvasRef.current.toDataURL();
    socketService.saveDrawing(roomId, drawingData);
  };

  const drawShape = (shape, start, end, temp = false) => {
    if (!context) return;
    
    // If temporary, draw on a temporary canvas overlay
    const ctx = temp ? context : context;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (shape === 'circle') {
      const radius = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      ) / 2;
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    } else if (shape === 'square') {
      const width = end.x - start.x;
      const height = end.y - start.y;
      ctx.rect(start.x, start.y, width, height);
    }
    
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    if (!canDraw) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'pen') {
      context.beginPath();
      context.moveTo(x, y);
    } else {
      setStartPoint({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    if (!canDraw || !isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'pen') {
      const drawingAction = {
        roomId,
        x0: context.lastX || x,
        y0: context.lastY || y,
        x1: x,
        y1: y,
        color,
        lineWidth
      };

      drawLine(drawingAction);
      socketService.emitDrawingAction(drawingAction);

      context.lastX = x;
      context.lastY = y;
    } else if (startPoint) {
      // Clear the canvas and redraw background
      const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.putImageData(imageData, 0, 0);
      
      drawShape(tool, startPoint, { x, y }, true);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (tool !== 'pen' && startPoint) {
      const rect = canvasRef.current.getBoundingClientRect();
      const endPoint = {
        x: rect.x,
        y: rect.y
      };
      
      drawShape(tool, startPoint, endPoint);
      // Emit shape drawing
      socketService.emitDrawingAction({
        roomId,
        type: tool,
        startPoint,
        endPoint,
        color,
        lineWidth
      });
    }
    
    context.lastX = undefined;
    context.lastY = undefined;
    setStartPoint(null);
    saveDrawing();
  };

  return (
    <div className="flex flex-col h-full">
      {canDraw && (
        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-t-xl">
          <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-2">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded ${tool === 'pen' ? 'bg-violet-500' : 'hover:bg-gray-600'}`}
              title="Pen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => setTool('circle')}
              className={`p-2 rounded ${tool === 'circle' ? 'bg-violet-500' : 'hover:bg-gray-600'}`}
              title="Circle"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
            </button>
            <button
              onClick={() => setTool('square')}
              className={`p-2 rounded ${tool === 'square' ? 'bg-violet-500' : 'hover:bg-gray-600'}`}
              title="Square"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="4" y="4" width="16" height="16" strokeWidth={2} />
              </svg>
            </button>
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            className="w-32"
          />
          <button
            onClick={() => {
              clearCanvas();
              socketService.emitDrawingAction({ roomId, clear: true });
            }}
            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
          >
            Clear
          </button>
          <button
            onClick={saveDrawing}
            className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30"
          >
            Save
          </button>
        </div>
      )}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className={`w-full h-full bg-white rounded-lg ${
            canDraw ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseOut={handleMouseUp}
        />
        {!canDraw && (
          <div className="absolute top-4 left-4 bg-black/50 px-4 py-2 rounded-lg">
            <p className="text-gray-400">View only mode</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
