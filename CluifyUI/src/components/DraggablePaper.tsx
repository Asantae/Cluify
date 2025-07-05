import React, { useRef, useState, useEffect } from 'react';
import { Paper } from '@mui/material';
import Draggable from 'react-draggable';
import { useModalStack } from '../contexts/ModalStackContext';

interface DraggablePaperProps {
  children: React.ReactNode;
  handleId: string;
  modalId: string;
  centerOnMount?: boolean;
  maxHeight?: string | number;
}

const DraggablePaper: React.FC<DraggablePaperProps> = ({ children, handleId, modalId, centerOnMount = false, maxHeight = '85vh' }) => {
  const nodeRef = useRef(null);
  const [initialPosition, setInitialPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const { registerModal, unregisterModal, bringToFront, getZIndex } = useModalStack();

  useEffect(() => {
    registerModal(modalId);
    return () => {
      unregisterModal(modalId);
    };
  }, [modalId, registerModal, unregisterModal]);
  
  useEffect(() => {
    if (centerOnMount && nodeRef.current && !isMounted) {
      const paperElement = nodeRef.current as HTMLElement;
      const { innerWidth, innerHeight } = window;
      const { clientWidth, clientHeight } = paperElement;
      
      const x = (innerWidth - clientWidth) / 2;
      const y = (innerHeight - clientHeight) / 2;
      
      setInitialPosition({ x, y });
    }
    // We set isMounted in a separate effect to ensure the position is calculated first.
    // This prevents a potential race condition.
    setIsMounted(true);
  }, [centerOnMount, isMounted]);

  const zIndex = getZIndex(modalId);

  return (
    // @ts-ignore - This is a known issue with react-draggable types and strict mode.
    <Draggable
      nodeRef={nodeRef}
      handle={`#${handleId}`}
      cancel={'[class*="MuiDialogContent-root"], [aria-label="close"]'}
      defaultPosition={initialPosition}
      onStart={() => bringToFront(modalId)} // Bring to front on drag start
    >
      <Paper
        ref={nodeRef}
        elevation={8}
        onMouseDown={() => bringToFront(modalId)} // Bring to front on click
        sx={{
          position: 'absolute',
          zIndex: zIndex, 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Prevents content from spilling out during drag
          maxHeight: maxHeight,
          ...(!initialPosition && centerOnMount ? { visibility: 'hidden' } : {}), // Hide until positioned
        }}
      >
        {children}
      </Paper>
    </Draggable>
  );
};

export default DraggablePaper; 