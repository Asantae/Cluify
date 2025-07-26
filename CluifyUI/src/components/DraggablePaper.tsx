import React, { useRef, useState, useEffect } from 'react';
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

  return (
    <Draggable
      nodeRef={nodeRef}
      handle={`#${handleId}`}
      cancel={'[class*="MuiDialogContent-root"], [aria-label="close"], button'}
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
          }}
        >
          {children}
        </Paper>
      </div>
    </Draggable>
  );
};

export default DraggablePaper; 