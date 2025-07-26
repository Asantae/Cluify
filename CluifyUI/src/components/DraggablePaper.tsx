import React, { useRef, useEffect } from 'react';
import { Paper, PaperProps } from '@mui/material';
import Draggable from 'react-draggable';
import { useModalStack } from '../contexts/ModalStackContext';

interface DraggablePaperProps {
  children: React.ReactNode;
  handleId: string;
  modalId: string;
  PaperProps?: PaperProps;
}

const DraggablePaper: React.FC<DraggablePaperProps> = ({ children, handleId, modalId, PaperProps = {} }) => {
  const nodeRef = useRef(null);
  const { registerModal, unregisterModal, bringToFront, getZIndex } = useModalStack();

  useEffect(() => {
    registerModal(modalId);
    return () => {
      unregisterModal(modalId);
    };
  }, [modalId, registerModal, unregisterModal]);

  const zIndex = getZIndex(modalId);

  // Calculate a reasonable default position that ensures the modal is visible
  const getDefaultPosition = () => {
    return {
      x: -85,
      y: 0
    };
  };

  const handleModalClick = () => {
    bringToFront(modalId);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle={`#${handleId}`}
      cancel={'[class*="MuiDialogContent-root"], [aria-label="close"], button'}
      defaultPosition={getDefaultPosition()}
      onStart={() => bringToFront(modalId)}
    >
      <div 
        ref={nodeRef}
        style={{
          position: 'absolute',
          zIndex: zIndex,
        }}
      >
        <Paper
          {...PaperProps}
          elevation={8}
          onMouseDown={() => bringToFront(modalId)}
          sx={{
            position: 'absolute',
            borderRadius: 0,
            ...PaperProps?.sx,
          }}
        >
          <div onClick={handleModalClick}>
            {children}
          </div>
        </Paper>
      </div>
    </Draggable>
  );
};

export default DraggablePaper; 