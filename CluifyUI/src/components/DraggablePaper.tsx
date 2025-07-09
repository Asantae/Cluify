import React, { useRef, useState, useEffect } from 'react';
import { Paper, PaperProps } from '@mui/material';
import Draggable from 'react-draggable';
import { useModalStack } from '../contexts/ModalStackContext';

interface DraggablePaperProps {
  children: React.ReactNode;
  handleId: string;
  modalId: string;
  centerOnMount?: boolean;
  PaperProps?: PaperProps;
}

const DraggablePaper: React.FC<DraggablePaperProps> = ({ children, handleId, modalId, centerOnMount = false, PaperProps = {} }) => {
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
    setIsMounted(true);
  }, [centerOnMount, isMounted]);

  const zIndex = getZIndex(modalId);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle={`#${handleId}`}
      cancel={'[class*="MuiDialogContent-root"], [aria-label="close"], button'}
      defaultPosition={initialPosition}
      onStart={() => bringToFront(modalId)}
    >
      <div ref={nodeRef}>
        <Paper
          {...PaperProps}
          elevation={8}
          onMouseDown={() => bringToFront(modalId)}
          sx={{
            position: 'absolute',
            zIndex: zIndex, 
            borderRadius: 0,
            ...PaperProps?.sx,
            ...(!initialPosition && centerOnMount ? { visibility: 'hidden' } : {}),
          }}
        >
          {children}
        </Paper>
      </div>
    </Draggable>
  );
};

export default DraggablePaper; 