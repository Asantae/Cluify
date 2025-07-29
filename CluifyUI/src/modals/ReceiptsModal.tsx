import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  DialogTitle,
} from '@mui/material';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import { searchPurchaseRecordsByDmv } from '../services/api';
import receiptTexture from '../assets/receipt_texture.png';

interface PurchaseRecord {
  Id: string;
  PersonId: string;
  StoreName: string;
  ItemBought: string;
  Price: number;
  PurchaseDate: string;
}

interface ReceiptsModalProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSelectRecord: (record: PurchaseRecord) => void;
  phoneOwnerName?: string | null;
  personId?: string | null;
}

const ReceiptsModal: React.FC<ReceiptsModalProps> = ({ 
  open,
  onClose, 
  darkMode, 
  onSelectRecord,
  phoneOwnerName,
  personId
}) => {
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const handleId = 'receiptsModalHandle';

  // Load purchase data when modal opens
  useEffect(() => {
    if (open && personId) {
      const loadData = async () => {
        try {
          const results = await searchPurchaseRecordsByDmv(personId);
          setPurchaseRecords(results);
        } catch (error) {
          // Error loading purchase data
        } finally {
        }
      };
      loadData();
    }
  }, [open, personId]);

  // Reset data when modal closes
  useEffect(() => {
    if (!open) {
      setPurchaseRecords([]);
    }
  }, [open]);

  // Load texture and set loaded state
  useEffect(() => {
    if (open) {
      const img = new Image();
      img.onload = () => setTextureLoaded(true);
      img.src = receiptTexture;
    } else {
      setTextureLoaded(false);
    }
  }, [open]);

  const borderColor = darkMode ? '#555' : '#333';

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      {open && (
        <DraggablePaper
          modalId="receiptsModal" 
          handleId={handleId}
          PaperProps={{
            sx: {
              position: 'relative',
              overflow: 'visible',
              color: '#000',
              fontFamily: 'monospace',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '1px solid #ccc',
              borderRadius: '8px',
              width: 280,
              maxWidth: 280,
              height: 320,
              maxHeight: 320,
              display: 'flex',
              flexDirection: 'column',
              outline: 'none',
              zIndex: -999
            }
          }}
        >
          <div>
            <Box
              sx={{
                position: 'absolute',
                top: -76,
                left: -38,
                width: 360,
                height: 640,
                backgroundImage: `url(${receiptTexture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: -1
              }}
            />
            {textureLoaded && (
              <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <DialogTitle
                  sx={{
                    minHeight: 36,
                    height: 36,
                    cursor: 'move',
                    position: 'relative',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    mb: 2
                  }}
                  id={handleId}
                >
                  {phoneOwnerName && (
                    <Typography sx={{
                      color: '#000',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}>
                      {phoneOwnerName}
                    </Typography>
                  )}
                  <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ color: '#000' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>

                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: 2,
                  paddingTop: 1,
                  minHeight: 0,
                  overflow: 'hidden'
                }}>
                  <Typography sx={{
                    color: '#000',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    mb: 2,
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    opacity: 0.8
                  }}>
                    PurchaseHacker
                  </Typography>
                  <Box sx={{ 
                    maxHeight: '150px', 
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#333',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#666',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      backgroundColor: '#888',
                    }
                  }}>
                    {purchaseRecords.map((record) => (
                      <Box
                        key={record.Id}
                        onClick={() => onSelectRecord(record)}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: 1,
                          p: 0.5,
                          mb: 0.5,
                          cursor: 'pointer',
                          borderBottom: `1px solid ${borderColor}`,
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.05)'
                          }
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#000' }}>
                            {record.StoreName}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#000' }}>
                            {record.ItemBought}
                          </Typography>
                          <Typography sx={{ fontSize: '0.6rem', color: '#666', mt: 0.5 }}>
                            {formatDate(record.PurchaseDate)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#000', textAlign: 'right' }}>
                          {formatPrice(record.Price)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </div>
        </DraggablePaper>
      )}
    </>
  );
};

export default ReceiptsModal; 