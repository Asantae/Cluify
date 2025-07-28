import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
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
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);


  // Load purchase data when modal opens
  useEffect(() => {
    if (open && personId) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const results = await searchPurchaseRecordsByDmv(personId);
          setPurchaseRecords(results);
        } catch (error) {
          // Error loading purchase data
        } finally {
          setIsLoading(false);
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

  const textColor = '#000'; // Receipt text should always be black
  const borderColor = darkMode ? '#555' : '#333';
  const handleId = "receipts-modal-handle";

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
              width: { xs: '90vw', sm: 300, md: 350 },
              maxWidth: '90vw',
              height: { xs: '70vh', sm: 600, md: 650 },
              maxHeight: '70vh',
              overflow: 'hidden',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              backgroundImage: `url(${receiptTexture})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              padding: 0,
            }
          }}
        >
            <Box 
              id={handleId}
              sx={{ cursor: 'move', textAlign: 'center', pt: 2, pb: 1, backgroundColor: 'transparent', position: 'relative' }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.05rem', opacity: 0 }}>
                PurchaseHacker
              </Typography>
              {phoneOwnerName && (
                <Typography sx={{ 
                  color: textColor, 
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}>
                  {phoneOwnerName}
                </Typography>
              )}
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: textColor }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ position: 'relative', overflowY: 'auto', p: { xs: 2, sm: 3 }, pt: 0, flexGrow: 1, maxHeight: { xs: '60vh', sm: 'none' }, backgroundColor: 'transparent' }}>
            {/* Receipt Header */}
            <Box sx={{ 
              width: '100%', 
              maxWidth: '300px',
              textAlign: 'center',
              mb: 2,
              backgroundColor: 'transparent'
            }}>
              <Typography sx={{ 
                color: textColor, 
                fontSize: '1rem',
                fontWeight: 600,
                mb: 1
              }}>
                PurchaseHacker
              </Typography>

            </Box>

            {/* Receipts List */}
            <Box sx={{ 
              width: '100%', 
              maxWidth: '300px',
              maxHeight: '500px',
              overflowY: 'auto',
              backgroundColor: 'transparent'
            }}>
              {isLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: 4,
                  backgroundColor: 'transparent'
                }}>
                  <Typography sx={{ 
                    color: textColor, 
                    fontSize: '1rem'
                  }}>
                    Loading receipts...
                  </Typography>
                </Box>
              ) : purchaseRecords.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {purchaseRecords.map((record) => (
                    <Box
                      key={record.Id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: borderColor,
                        borderRadius: 1,
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      }}
                      onClick={() => onSelectRecord(record)}
                    >
                      {/* Store Header */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 1,
                        borderBottom: `1px solid ${borderColor}`,
                        pb: 1
                      }}>
                        <Typography sx={{ 
                          color: textColor, 
                          fontSize: '1.1rem',
                          fontWeight: 700
                        }}>
                          {record.StoreName}
                        </Typography>
                      </Box>

                      {/* Item Details */}
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ 
                          color: textColor, 
                          fontSize: '1rem',
                          fontWeight: 600,
                          mb: 0.5
                        }}>
                          {record.ItemBought}
                        </Typography>
                        <Typography sx={{ 
                          color: textColor, 
                          fontSize: '1.2rem',
                          fontWeight: 700
                        }}>
                          {formatPrice(record.Price)}
                        </Typography>
                      </Box>

                      {/* Date */}
                                             <Typography sx={{ 
                         color: textColor, 
                         fontSize: '0.8rem',
                         opacity: darkMode ? 0.5 : 0.7
                       }}>
                         {formatDate(record.PurchaseDate)}
                       </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: 4,
                  backgroundColor: 'transparent'
                }}>
                                     <Typography sx={{ 
                     color: textColor, 
                     fontSize: '1rem',
                     opacity: darkMode ? 0.5 : 0.7
                   }}>
                     No recent receipts found
                   </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DraggablePaper>
      )}
    </>
  );
};

export default ReceiptsModal; 