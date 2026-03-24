
// Mock Data lang to for notifications


export const residentNotifications = [
  {
    id: 1,
    type: 'Request',
    message: 'Your Certificate of Residency is ready. Click here to download or visit the Brgy. Hall.',
    timestamp: '2 mins ago',
    attachment: 'Certificate_of_Resid...',
    isRead: false,
    category: 'Request'
  },
  {
    id: 2,
    type: 'eID',
    message: 'Your eID application has been approved. You may now claim your ID.',
    timestamp: '3 hrs ago',
    isRead: true,
    category: 'eID'
  },
  {
    id: 3,
    type: 'eID',
    message: 'Some required documents are missing. Kindly upload them.',
    timestamp: 'Mar 12, 4:21 PM',
    isRead: true,
    category: 'eID'
  },
  {
    id: 4,
    type: 'eID',
    message: 'Your eID application was rejected. Please review and resubmit.',
    timestamp: 'Mar 9, 3:15 PM',
    attachment: 'eID_Rejection_Jus...',
    isRead: false,
    category: 'eID'
  },
  {
    id: 5,
    type: 'Resident',
    message: 'Your profile information has been successfully updated.',
    timestamp: 'Mar 8, 7:04 AM',
    isRead: true,
    category: 'Resident'
  }
];

export const adminNotifications = [
  {
    id: 101,
    type: 'Request',
    message: 'New Certificate of Residency request from Juan Dela Cruz.',
    timestamp: '5 mins ago',
    isRead: false,
    category: 'Request'
  },
  {
    id: 102,
    type: 'eID',
    message: 'Incoming eID application from Maria Clara for review.',
    timestamp: '1 hr ago',
    isRead: false,
    category: 'eID'
  },
  {
    id: 103,
    type: 'Request',
    message: 'New Brgy. Clearance request from Jose Rizal.',
    timestamp: '2 hrs ago',
    isRead: true,
    category: 'Request'
  },
  {
    id: 104,
    type: 'eID',
    message: 'Incoming eID application from Andres Bonifacio.',
    timestamp: '4 hrs ago',
    isRead: true,
    category: 'eID'
  },
  {
    id: 105,
    type: 'Resident',
    message: 'New resident registration for Emilio Aguinaldo pending approval.',
    timestamp: 'Yesterday',
    isRead: false,
    category: 'Resident'
  }
];

// Fallback for backward compatibility if needed
export const notifications = residentNotifications;

