import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Owns the canvas element's lifecycle: acquiring its 2D context and keeping
 * its backing resolution in sync with both its CSS layout size and the
 * display's devicePixelRatio (so drawing stays sharp on high-DPI screens).
 *
 * Deliberately scoped to just the element/context/resize concern — it does
 * not know about grid coordinates, zoom, or pan. Those live in
 * SimulationCanvas, which is the one place that needs to translate between
 * pixels and grid cells.
 */
export function useCanvas() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    contextRef.current = canvas.getContext('2d');

    const applySize = (cssWidth, cssHeight) => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const context = contextRef.current;
      if (!context) return;

      canvas.width = Math.round(cssWidth * devicePixelRatio);
      canvas.height = Math.round(cssHeight * devicePixelRatio);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      // Scale the drawing context so all drawing code can keep working in
      // CSS pixel coordinates without knowing about devicePixelRatio.
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      setSize({ width: cssWidth, height: cssHeight });
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      applySize(width, height);
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  const getContext = useCallback(() => contextRef.current, []);

  return { canvasRef, getContext, size };
}
