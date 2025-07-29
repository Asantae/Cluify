import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Paper,
  Divider,
  DialogTitle
} from '@mui/material';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MessageIcon from '@mui/icons-material/Message';
import ShareIcon from '@mui/icons-material/Share';
import HistoryIcon from '@mui/icons-material/History';
import blankPhoneTexture from '../assets/blank_phone_texture.png';

interface PhoneRecord {
  Id: string;
  PersonId: string;
  ToName: string;
  MessageContent: string;
  MessageDateTime: string;
}

interface SocialMediaPost {
  Id: string;
  PersonId: string;
  Content: string;
  PostDate: string;
}

interface SearchHistoryRecord {
  Id: string;
  PersonId: string;
  Query: string;
  SearchDate: string;
}

interface PhoneRecordsModalProps {
  open: boolean;
  onClose: () => void;
  onSelectRecord: (record: PhoneRecord | SocialMediaPost | SearchHistoryRecord) => void;
  phoneOwnerName?: string | null;
  onLoadPhoneData?: () => Promise<{
    phoneRecords: PhoneRecord[];
    socialMediaPosts: SocialMediaPost[];
    searchHistory: SearchHistoryRecord[];
  }>;
}

const PhoneRecordsModal: React.FC<PhoneRecordsModalProps> = ({ 
  open,
  onClose, 
  onSelectRecord,
  phoneOwnerName,
  onLoadPhoneData
}) => {
  const [currentView, setCurrentView] = useState<'main' | 'phone' | 'social' | 'search'>('main');
  const [currentResults, setCurrentResults] = useState<(PhoneRecord | SocialMediaPost | SearchHistoryRecord)[]>([]);
  
  // Store all phone data
  const [phoneRecords, setPhoneRecords] = useState<PhoneRecord[]>([]);
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryRecord[]>([]);
  const handleId = 'phoneRecordsModalHandle';


  // Load phone data when modal opens
  useEffect(() => {
    if (open && onLoadPhoneData && phoneOwnerName) {
      const loadData = async () => {
        try {
          const data = await onLoadPhoneData();
          setPhoneRecords(data.phoneRecords);
          setSocialMediaPosts(data.socialMediaPosts);
          setSearchHistory(data.searchHistory);
        } catch (error) {
          // Error loading phone data
        }
      };
      loadData();
    }
  }, [open, onLoadPhoneData, phoneOwnerName]);

  // Reset data when modal closes
  useEffect(() => {
    if (!open) {
      setPhoneRecords([]);
      setSocialMediaPosts([]);
      setSearchHistory([]);
      setCurrentView('main');
    }
  }, [open]);



  const handleMenuClick = (type: 'phone' | 'social' | 'search') => {
    if (type === 'phone') {
      setCurrentResults(phoneRecords);
      setCurrentView('phone');
    } else if (type === 'social') {
      setCurrentResults(socialMediaPosts);
      setCurrentView('social');
    } else {
      setCurrentResults(searchHistory);
      setCurrentView('search');
    }
  };

  const handleBackClick = () => {
    setCurrentView('main');
  };

  const handleSelectRecord = (record: PhoneRecord | SocialMediaPost | SearchHistoryRecord) => {
    onSelectRecord(record);
    // Don't close the modal when evidence is selected
  };

  const textColor = '#fff';
  const borderColor = '#444';

  return (
    <>
      {open && (
        <DraggablePaper 
          modalId="phoneRecordsModal" 
          handleId={handleId}
          PaperProps={{
            sx: {
              position: 'relative',
              overflow: 'visible',
              color: '#000',
              fontFamily: "'Courier New', Courier, monospace",
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              border: '1px solid #888',
              borderRadius: '4px',
              width: 240,
              maxWidth: 240,
              height: 500,
              maxHeight: 500,
              display: 'flex',
              flexDirection: 'column',
            }
          }}
        >
          <div>
            <Box
              sx={{
                backgroundImage: `url(${blankPhoneTexture})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                position: 'absolute',
                top: -70,
                left: -60,
                width: 360,
                height: 640,
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <DialogTitle
                sx={{
                  minHeight: 36,
                  height: 36,
                  cursor: 'move',
                  backgroundColor: 'transparent',
                  position: 'relative',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  '& .MuiTypography-root': {
                    backgroundColor: 'transparent'
                  }
                }}
                id={handleId}
              >
                {phoneOwnerName && (
                  <Typography sx={{
                    color: textColor,
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}>
                    {phoneOwnerName}
                  </Typography>
                )}
                <IconButton
                  aria-label="close"
                  onClick={onClose}
                  sx={{ color: textColor }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: 3,
                  paddingTop: 5,
                  minHeight: 0,
                  overflow: 'hidden'
                }}>
                {currentView === 'main' && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    flex: 1,
                    justifyContent: 'center'
                  }}>
                    <Box
                      onClick={() => handleMenuClick('phone')}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: 2,
                        cursor: 'pointer',
                        borderRadius: 1,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <MessageIcon sx={{ color: textColor, fontSize: 24 }} />
                      <Typography sx={{ color: textColor, fontSize: '1.1rem', fontWeight: 500 }}>
                        Messages
                      </Typography>
                    </Box>
                    <Divider sx={{ backgroundColor: borderColor, opacity: 0.3 }} />
                    
                    <Box
                      onClick={() => handleMenuClick('social')}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: 2,
                        cursor: 'pointer',
                        borderRadius: 1,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <ShareIcon sx={{ color: textColor, fontSize: 24 }} />
                      <Typography sx={{ color: textColor, fontSize: '1.1rem', fontWeight: 500 }}>
                        Social Media
                      </Typography>
                    </Box>
                    <Divider sx={{ backgroundColor: borderColor, opacity: 0.3 }} />
                    
                    <Box
                      onClick={() => handleMenuClick('search')}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: 2,
                        cursor: 'pointer',
                        borderRadius: 1,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <HistoryIcon sx={{ color: textColor, fontSize: 24 }} />
                      <Typography sx={{ color: textColor, fontSize: '1.1rem', fontWeight: 500 }}>
                        Search History
                      </Typography>
                    </Box>
                  </Box>
                )}

                {(currentView === 'phone' || currentView === 'social' || currentView === 'search') && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden'
                  }}>
                    {/* Header with back button */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      mb: 2,
                      paddingBottom: 1,
                      borderBottom: `1px solid ${borderColor}`,
                      opacity: 0.7
                    }}>
                      <IconButton
                        onClick={handleBackClick}
                        sx={{ color: textColor, padding: 0.5 }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                      <Typography sx={{ color: textColor, fontSize: '1.1rem', fontWeight: 500 }}>
                        {currentView === 'phone' ? 'Messages' : 
                         currentView === 'social' ? 'Social Media' : 'Search History'}
                      </Typography>
                    </Box>

                    {/* Content */}
                    <Box sx={{ 
                      flex: 1, 
                      overflow: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}>
                      {currentResults.length === 0 ? (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          flex: 1,
                          opacity: 0.7
                        }}>
                          <Typography sx={{ color: textColor, fontSize: '0.9rem' }}>
                            No {currentView === 'phone' ? 'messages' : 
                                 currentView === 'social' ? 'social media posts' : 'search history'} found
                          </Typography>
                        </Box>
                      ) : (
                        currentResults.map((record) => (
                          <Paper
                            key={record.Id}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              borderColor: 'rgba(255,255,255,0.2)',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                            onClick={() => handleSelectRecord(record)}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {currentView === 'phone' ? (record as PhoneRecord).ToName : 
                                 currentView === 'social' ? 'Social Media Post' : 'Search Query'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: textColor, fontSize: '0.85rem', mb: 0.5 }}>
                              {currentView === 'phone' ? (record as PhoneRecord).MessageContent :
                               currentView === 'social' ? (record as SocialMediaPost).Content :
                               (record as SearchHistoryRecord).Query}
                            </Typography>
                            <Typography variant="caption" sx={{ color: textColor, opacity: 0.7, fontSize: '0.75rem' }}>
                              {currentView === 'phone' ? (record as PhoneRecord).MessageDateTime :
                               currentView === 'social' ? (record as SocialMediaPost).PostDate :
                               (record as SearchHistoryRecord).SearchDate}
                            </Typography>
                          </Paper>
                        ))
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </div>
        </DraggablePaper>
      )}
    </>
  );
};

export default PhoneRecordsModal; 