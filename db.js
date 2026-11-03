/**
 * AI-POWERED SMART BLOOD DONATION & MANAGEMENT SYSTEM
 * Centralized Database, Authentication, RBAC & AI Decision Engine
 */

(function (window) {
  'use strict';

  // 1. Password Hashing Utility (SHA-256 via Web Crypto API)
  async function hashPassword(plainText) {
    if (!plainText) return '';
    try {
      const msgUint8 = new TextEncoder().encode(plainText + '_salt_blood_coop_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback pseudo-hash if crypto is unavailable in environment
      let hash = 0;
      for (let i = 0; i < plainText.length; i++) {
        hash = ((hash << 5) - hash) + plainText.charCodeAt(i);
        hash |= 0;
      }
      return 'legacy_' + Math.abs(hash).toString(16);
    }
  }

  // 2. Haversine Distance (Kilometers)
  function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 10) / 10;
  }

  // Estimated Travel Time in Minutes (assuming average 35 km/h urban emergency transit + 5m dispatch setup)
  function estimateTravelTimeMinutes(distanceKm) {
    if (distanceKm <= 0) return 5;
    return Math.round((distanceKm / 35) * 60 + 5);
  }

  // 3. Medically Validated Blood Compatibility Matrix
  // Recipient -> Compatible Donor Blood Groups
  const RECIPIENT_COMPATIBILITY = {
    'O-': ['O-'],
    'O+': ['O+', 'O-'],
    'A-': ['A-', 'O-'],
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  };

  const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // 4. Default Seed State (Centralized Tamil Nadu Healthcare Network)
  const INITIAL_CENTRAL_DB = {
    users: [
      {
        id: 'usr_admin_001',
        name: 'State Health Director (Admin)',
        email: 'admin@bloodcoop.gov.in',
        passwordHash: '1ede04d2b1be558f32fd78db0d147c6d3516fdf96fb38864705b1df23aed0afc', // admin123
        role: 'admin',
        phone: '+91 94440 12345',
        status: 'active',
        createdAt: '2026-01-10T08:00:00Z',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr_hosp_001',
        name: 'Rajiv Gandhi Govt General Hospital',
        email: 'hospital1@rggh.gov.in',
        passwordHash: '151a2e6c56241c8f4ada18c379361137ec0854bc440d47c0c3fed5808ad57d8f', // hosp123
        role: 'hospital',
        phone: '+91 44 2530 5000',
        status: 'active',
        createdAt: '2026-01-12T09:30:00Z',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr_hosp_002',
        name: 'Apollo Hospital Greams Road',
        email: 'emergency@apollohospitals.com',
        passwordHash: '151a2e6c56241c8f4ada18c379361137ec0854bc440d47c0c3fed5808ad57d8f',
        role: 'hospital',
        phone: '+91 44 2829 0200',
        status: 'active',
        createdAt: '2026-01-15T11:00:00Z',
        lastLogin: '2026-11-01T14:20:00Z'
      },
      {
        id: 'usr_bank_001',
        name: 'Chennai Red Cross Blood Bank',
        email: 'bloodbank1@redcrosschennai.org',
        passwordHash: '429517af87ebf73b5aeabfd1e532efc3bb112d7819851ebebc9bd219bd93bea0', // bank123
        role: 'bloodbank',
        phone: '+91 44 2855 4425',
        status: 'active',
        createdAt: '2026-01-14T10:00:00Z',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr_bank_002',
        name: 'Rotary Central TTK Blood Bank',
        email: 'ttk@rotarycentralbloodbank.org',
        passwordHash: '429517af87ebf73b5aeabfd1e532efc3bb112d7819851ebebc9bd219bd93bea0',
        role: 'bloodbank',
        phone: '+91 44 2829 3345',
        status: 'active',
        createdAt: '2026-01-18T12:00:00Z',
        lastLogin: '2026-11-02T10:15:00Z'
      },
      {
        id: 'usr_donor_001',
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        passwordHash: '77556aeaaf453e10dc9bf88b20379ef105e1be9002e73e89ee5b2b90cf5c9dea', // donor123
        role: 'donor',
        phone: '+91 98765 43210',
        status: 'active',
        createdAt: '2026-02-01T14:00:00Z',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr_donor_002',
        name: 'Priya Sundaram',
        email: 'priya.sundaram@gmail.com',
        passwordHash: '77556aeaaf453e10dc9bf88b20379ef105e1be9002e73e89ee5b2b90cf5c9dea',
        role: 'donor',
        phone: '+91 98765 43211',
        status: 'active',
        createdAt: '2026-02-05T15:30:00Z',
        lastLogin: '2026-11-01T09:00:00Z'
      }
    ],
    hospitals: [
      {
        id: 'hosp_001',
        userId: 'usr_hosp_001',
        name: 'Rajiv Gandhi Govt General Hospital',
        city: 'Chennai',
        address: 'EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003',
        lat: 13.0798,
        lng: 80.2818,
        contact: '+91 44 2530 5000',
        inventory: { 'O+': 3, 'O-': 1, 'A+': 4, 'A-': 0, 'B+': 2, 'B-': 1, 'AB+': 2, 'AB-': 0 },
        requiredUnits: 15
      },
      {
        id: 'hosp_002',
        userId: 'usr_hosp_002',
        name: 'Apollo Hospital Greams Road',
        city: 'Chennai',
        address: '21 Greams Lane, Off Greams Road, Thousand Lights, Chennai 600006',
        lat: 13.0573,
        lng: 80.2520,
        contact: '+91 44 2829 0200',
        inventory: { 'O+': 6, 'O-': 2, 'A+': 5, 'A-': 1, 'B+': 4, 'B-': 0, 'AB+': 3, 'AB-': 1 },
        requiredUnits: 10
      },
      {
        id: 'hosp_003',
        userId: 'usr_hosp_003',
        name: 'Christian Medical College (CMC)',
        city: 'Vellore',
        address: 'Ida Scudder Road, Vellore, Tamil Nadu 632004',
        lat: 12.9254,
        lng: 79.1352,
        contact: '+91 416 228 1000',
        inventory: { 'O+': 4, 'O-': 0, 'A+': 6, 'A-': 2, 'B+': 5, 'B-': 1, 'AB+': 1, 'AB-': 0 },
        requiredUnits: 8
      }
    ],
    bloodBanks: [
      {
        id: 'bank_001',
        userId: 'usr_bank_001',
        name: 'Chennai Red Cross Blood Bank',
        city: 'Chennai',
        address: 'Red Cross Building, 50 Montieth Road, Egmore, Chennai 600008',
        lat: 13.0732,
        lng: 80.2609,
        contact: '+91 44 2855 4425',
        status: 'verified',
        inventory: { 'O+': 8, 'O-': 3, 'A+': 12, 'A-': 2, 'B+': 14, 'B-': 4, 'AB+': 5, 'AB-': 1 },
        lastInventoryUpdate: new Date().toISOString()
      },
      {
        id: 'bank_002',
        userId: 'usr_bank_002',
        name: 'Rotary Central TTK Blood Bank',
        city: 'Chennai',
        address: '130 Marshalls Road, Egmore, Chennai 600008',
        lat: 13.0418,
        lng: 80.2505,
        contact: '+91 44 2829 3345',
        status: 'verified',
        inventory: { 'O+': 2, 'O-': 1, 'A+': 7, 'A-': 1, 'B+': 6, 'B-': 1, 'AB+': 4, 'AB-': 2 },
        lastInventoryUpdate: new Date().toISOString()
      },
      {
        id: 'bank_003',
        userId: 'usr_bank_003',
        name: 'Lions Blood Bank & Research Foundation',
        city: 'Chennai',
        address: '130 Arcot Road, Kodambakkam, Chennai 600024',
        lat: 13.0601,
        lng: 80.2405,
        contact: '+91 44 2484 2233',
        status: 'verified',
        inventory: { 'O+': 6, 'O-': 0, 'A+': 9, 'A-': 0, 'B+': 8, 'B-': 2, 'AB+': 3, 'AB-': 0 },
        lastInventoryUpdate: new Date().toISOString()
      }
    ],
    donors: [
      {
        id: 'dnr_001',
        userId: 'usr_donor_001',
        name: 'John Doe',
        bloodGroup: 'O+',
        phone: '+91 98765 43210',
        city: 'Chennai',
        address: 'Park Town, Chennai Central, Tamil Nadu',
        lat: 13.0827,
        lng: 80.2707,
        age: 28,
        weight: 72,
        lastDonationDate: '2026-08-15',
        daysSinceLastDonation: 80,
        availability: 'available',
        screening: {
          status: 'GREEN',
          notes: 'No clinical eligibility concerns identified from reported profile.',
          evaluatedAt: '2026-11-01T10:00:00Z'
        },
        reliability: 96,
        totalDonations: 6,
        verificationStatus: 'verified',
        donationHistory: [
          { date: '2026-08-15', location: 'Rajiv Gandhi Govt General Hospital', units: 1, type: 'Emergency Trauma' },
          { date: '2026-03-10', location: 'Chennai Red Cross Camp', units: 1, type: 'Voluntary Camp' }
        ]
      },
      {
        id: 'dnr_002',
        userId: 'usr_donor_002',
        name: 'Priya Sundaram',
        bloodGroup: 'O+',
        phone: '+91 98765 43211',
        city: 'Chennai',
        address: 'Usman Road, T. Nagar, Chennai',
        lat: 13.0418,
        lng: 80.2341,
        age: 26,
        weight: 58,
        lastDonationDate: '2026-07-20',
        daysSinceLastDonation: 106,
        availability: 'available',
        screening: {
          status: 'GREEN',
          notes: 'Eligible for whole blood donation.',
          evaluatedAt: '2026-11-01T11:00:00Z'
        },
        reliability: 92,
        totalDonations: 4,
        verificationStatus: 'verified',
        donationHistory: [
          { date: '2026-07-20', location: 'Apollo Hospital Greams Road', units: 1, type: 'Emergency Surgery' }
        ]
      },
      {
        id: 'dnr_003',
        userId: 'usr_donor_003',
        name: 'Karthik Rajan',
        bloodGroup: 'B+',
        phone: '+91 98765 43212',
        city: 'Chennai',
        address: '2nd Avenue, Anna Nagar, Chennai',
        lat: 13.0850,
        lng: 80.2101,
        age: 32,
        weight: 76,
        lastDonationDate: '2026-09-02',
        daysSinceLastDonation: 62,
        availability: 'available',
        screening: {
          status: 'GREEN',
          notes: 'Regular donor, no contraindications reported.',
          evaluatedAt: '2026-11-01T09:30:00Z'
        },
        reliability: 94,
        totalDonations: 8,
        verificationStatus: 'verified',
        donationHistory: [
          { date: '2026-09-02', location: 'Lions Blood Bank', units: 1, type: 'Voluntary' }
        ]
      },
      {
        id: 'dnr_004',
        userId: 'usr_donor_004',
        name: 'Ananya Iyer',
        bloodGroup: 'A+',
        phone: '+91 98765 43213',
        city: 'Chennai',
        address: 'Velachery Main Road, Chennai',
        lat: 12.9759,
        lng: 80.2212,
        age: 24,
        weight: 54,
        lastDonationDate: '2026-06-14',
        daysSinceLastDonation: 142,
        availability: 'available',
        screening: {
          status: 'GREEN',
          notes: 'Fit and ready for donation.',
          evaluatedAt: '2026-10-25T14:00:00Z'
        },
        reliability: 98,
        totalDonations: 3,
        verificationStatus: 'verified',
        donationHistory: []
      },
      {
        id: 'dnr_005',
        userId: 'usr_donor_005',
        name: 'Rajesh Kumar',
        bloodGroup: 'B+',
        phone: '+91 98765 43214',
        city: 'Chennai',
        address: 'Lattice Bridge Road, Adyar, Chennai',
        lat: 13.0012,
        lng: 80.2565,
        age: 29,
        weight: 65,
        lastDonationDate: '2026-10-10',
        daysSinceLastDonation: 24,
        availability: 'unavailable',
        screening: {
          status: 'RED',
          notes: 'Donation interval < 56 days (24 days elapsed). Temporary rest period mandatory.',
          evaluatedAt: '2026-10-10T12:00:00Z'
        },
        reliability: 95,
        totalDonations: 5,
        verificationStatus: 'verified',
        donationHistory: []
      },
      {
        id: 'dnr_006',
        userId: 'usr_donor_006',
        name: 'Suresh Raman',
        bloodGroup: 'O-',
        phone: '+91 98765 43216',
        city: 'Chennai',
        address: 'Luz Church Road, Mylapore, Chennai',
        lat: 13.0339,
        lng: 80.2676,
        age: 35,
        weight: 80,
        lastDonationDate: '2026-08-01',
        daysSinceLastDonation: 94,
        availability: 'available',
        screening: {
          status: 'GREEN',
          notes: 'Universal O- donor, verified.',
          evaluatedAt: '2026-10-30T16:00:00Z'
        },
        reliability: 98,
        totalDonations: 12,
        verificationStatus: 'verified',
        donationHistory: []
      }
    ],
    bloodRequests: [
      {
        id: 'REQ-TN-2026-101',
        hospitalId: 'hosp_001',
        hospitalName: 'Rajiv Gandhi Govt General Hospital',
        hospitalLat: 13.0798,
        hospitalLng: 80.2818,
        bloodGroup: 'O+',
        unitsRequired: 3,
        urgency: 'emergency',
        requiredDate: '2026-11-03',
        patientRef: 'TRAUMA-ICU-402',
        additionalNotes: 'Emergency polytrauma surgery in OT-3. Urgent requirement.',
        status: 'awaiting_approval',
        createdAt: '2026-11-03T14:15:00Z',
        aiRecommendation: null // To be filled dynamically by AI engine
      },
      {
        id: 'REQ-TN-2026-102',
        hospitalId: 'hosp_002',
        hospitalName: 'Apollo Hospital Greams Road',
        hospitalLat: 13.0573,
        hospitalLng: 80.2520,
        bloodGroup: 'A+',
        unitsRequired: 2,
        urgency: 'urgent',
        requiredDate: '2026-11-04',
        patientRef: 'SURG-CAR-118',
        additionalNotes: 'Scheduled cardiothoracic bypass procedure reserve.',
        status: 'fulfilled',
        createdAt: '2026-11-02T16:40:00Z',
        fulfilledBy: 'Rotary Central TTK Blood Bank (2 units A+ reserved)',
        aiRecommendation: null
      }
    ],
    inventoryTransactions: [
      {
        id: 'TXN-001',
        bankId: 'bank_001',
        bankName: 'Chennai Red Cross Blood Bank',
        bloodGroup: 'O+',
        units: 4,
        type: 'addition',
        reason: 'Voluntary blood drive collection intake at Loyola College',
        timestamp: '2026-11-02T11:00:00Z'
      },
      {
        id: 'TXN-002',
        bankId: 'bank_002',
        bankName: 'Rotary Central TTK Blood Bank',
        bloodGroup: 'A+',
        units: 2,
        type: 'fulfillment',
        reason: 'Emergency dispatch fulfilled for Apollo Hospital (REQ-TN-2026-102)',
        timestamp: '2026-11-02T17:10:00Z'
      }
    ],
    notifications: [
      {
        id: 'NOTIF-001',
        targetRole: 'admin',
        title: 'Emergency Blood Request',
        message: 'Rajiv Gandhi Govt General Hospital created an EMERGENCY request for 3 units of O+ blood.',
        type: 'alert',
        isRead: false,
        timestamp: '2026-11-03T14:15:00Z'
      },
      {
        id: 'NOTIF-002',
        targetRole: 'hospital',
        targetUserId: 'usr_hosp_002',
        title: 'Request Fulfilled',
        message: 'Your request for 2 units of A+ blood has been fulfilled by Rotary Central TTK Blood Bank.',
        type: 'success',
        isRead: true,
        timestamp: '2026-11-02T17:10:00Z'
      }
    ],
    auditLogs: [
      {
        id: 'AUD-001',
        timestamp: '2026-11-02T17:10:00Z',
        actor: 'Chennai Red Cross Staff',
        role: 'bloodbank',
        action: 'INVENTORY_DISPATCH',
        details: 'Dispatched 2 units of A+ to Apollo Hospital for ticket REQ-TN-2026-102.'
      },
      {
        id: 'AUD-002',
        timestamp: '2026-11-03T14:15:00Z',
        actor: 'Dr. S. Ramanathan (RGGH)',
        role: 'hospital',
        action: 'REQUEST_SUBMISSION',
        details: 'Submitted Emergency Request REQ-TN-2026-101 for 3 units O+ blood.'
      }
    ]
  };

  // 5. Database Class
  class CentralBloodDB {
    constructor() {
      this.STORAGE_KEY = 'ai_smart_blood_central_db_v2';
      this.SESSION_KEY = 'ai_smart_blood_session_v2';
      this.data = null;
      this.currentUser = null;
      this.init();
    }

    init() {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          this.data = JSON.parse(stored);
        } catch (e) {
          console.warn('Failed parsing stored central DB, restoring seeds:', e);
          this.data = JSON.parse(JSON.stringify(INITIAL_CENTRAL_DB));
          this.save();
        }
      } else {
        this.data = JSON.parse(JSON.stringify(INITIAL_CENTRAL_DB));
        this.save();
      }

      // Restore session if available
      const sess = localStorage.getItem(this.SESSION_KEY);
      if (sess) {
        try {
          const userObj = JSON.parse(sess);
          // Verify user still exists in database
          const found = this.data.users.find(u => u.id === userObj.id && u.status === 'active');
          if (found) {
            this.currentUser = found;
          } else {
            localStorage.removeItem(this.SESSION_KEY);
          }
        } catch (e) {
          localStorage.removeItem(this.SESSION_KEY);
        }
      }

      // Pre-compute AI recommendations for pending requests
      this.evaluateAllPendingRequestsAI();
    }

    save() {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    resetToDefault() {
      this.data = JSON.parse(JSON.stringify(INITIAL_CENTRAL_DB));
      this.save();
      this.evaluateAllPendingRequestsAI();
      return true;
    }

    // --- AUTHENTICATION & SESSION MANAGEMENT ---
    async registerUser({ name, email, password, role, phone, details = {} }) {
      email = email.trim().toLowerCase();
      // Check for duplicate
      if (this.data.users.some(u => u.email === email)) {
        throw new Error('An account with this email address already exists.');
      }

      // Admin accounts cannot be registered publicly
      if (role === 'admin') {
        throw new Error('Administrative accounts cannot be registered publicly.');
      }

      const pHash = await hashPassword(password);
      const userId = 'usr_' + role + '_' + Date.now();
      
      const newUser = {
        id: userId,
        name: name.trim(),
        email: email,
        passwordHash: pHash,
        role: role,
        phone: phone ? phone.trim() : '',
        status: 'pending_approval', // Strict admin verification required!
        createdAt: new Date().toISOString(),
        lastLogin: null,
        details: details
      };

      this.data.users.push(newUser);

      // Create role entity
      if (role === 'hospital') {
        this.data.hospitals.push({
          id: 'hosp_' + Date.now(),
          userId: userId,
          name: name.trim(),
          city: details.city || 'Chennai',
          address: details.address || '',
          lat: parseFloat(details.lat) || 13.0827,
          lng: parseFloat(details.lng) || 80.2707,
          contact: phone || '',
          inventory: { 'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0 },
          requiredUnits: 0
        });
      } else if (role === 'bloodbank') {
        this.data.bloodBanks.push({
          id: 'bank_' + Date.now(),
          userId: userId,
          name: name.trim(),
          city: details.city || 'Chennai',
          address: details.address || '',
          lat: parseFloat(details.lat) || 13.0732,
          lng: parseFloat(details.lng) || 80.2609,
          contact: phone || '',
          status: 'pending',
          inventory: { 'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0 },
          lastInventoryUpdate: new Date().toISOString()
        });
      } else if (role === 'donor') {
        // Evaluate preliminary screening
        const screeningResult = this.evaluatePreliminaryDonorScreening({
          age: parseInt(details.age) || 25,
          weight: parseInt(details.weight) || 60,
          bloodGroup: details.bloodGroup || 'O+',
          daysSinceLastDonation: parseInt(details.daysSinceLastDonation) || 90,
          hasChronicConditions: details.hasChronicConditions || false,
          takingMedications: details.takingMedications || false,
          recentIllness: details.recentIllness || false
        });

        this.data.donors.push({
          id: 'dnr_' + Date.now(),
          userId: userId,
          name: name.trim(),
          bloodGroup: details.bloodGroup || 'O+',
          phone: phone || '',
          city: details.city || 'Chennai',
          address: details.address || '',
          lat: parseFloat(details.lat) || 13.0827,
          lng: parseFloat(details.lng) || 80.2707,
          age: parseInt(details.age) || 25,
          weight: parseInt(details.weight) || 60,
          lastDonationDate: details.lastDonationDate || '',
          daysSinceLastDonation: parseInt(details.daysSinceLastDonation) || 90,
          availability: 'available',
          screening: screeningResult,
          reliability: 95,
          totalDonations: 0,
          verificationStatus: 'pending',
          donationHistory: []
        });
      }

      // Log activity and create admin notification
      this.addAuditLog('System Registration', role, 'NEW_REGISTRATION', `New ${role} registration pending approval: ${name} (${email})`);
      this.addNotification({
        targetRole: 'admin',
        title: 'New Registration Awaiting Approval',
        message: `${name} has registered as a ${role.toUpperCase()}. Admin verification required.`,
        type: 'info'
      });

      this.save();
      return newUser;
    }

    async login(email, password, requiredRole = null) {
      email = email.trim().toLowerCase();
      const pHash = await hashPassword(password);
      
      const user = this.data.users.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid email or password.');
      }

      if (user.passwordHash !== pHash) {
        throw new Error('Invalid email or password.');
      }

      // Check portal access role
      if (requiredRole && user.role !== requiredRole) {
        throw new Error(`Unauthorized portal access. You cannot log into the ${requiredRole.toUpperCase()} portal with a ${user.role.toUpperCase()} account.`);
      }

      // Account verification guard
      if (user.status === 'pending_approval') {
        throw new Error('Your registration has been submitted and is currently awaiting Administrator verification. You will be able to log in once approved.');
      }

      if (user.status === 'suspended') {
        throw new Error('This account has been suspended by the State Administrator. Please contact support.');
      }

      user.lastLogin = new Date().toISOString();
      this.currentUser = user;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));

      this.addAuditLog(user.name, user.role, 'LOGIN_SUCCESS', `User authenticated to ${user.role} portal.`);
      this.save();
      return user;
    }

    logout() {
      if (this.currentUser) {
        this.addAuditLog(this.currentUser.name, this.currentUser.role, 'LOGOUT', `User ended session.`);
      }
      this.currentUser = null;
      localStorage.removeItem(this.SESSION_KEY);
    }

    getCurrentUser() {
      return this.currentUser;
    }

    // --- ADMIN USER & ENTITY APPROVAL WORKFLOW ---
    updateUserStatus(userId, newStatus) {
      const user = this.data.users.find(u => u.id === userId);
      if (!user) throw new Error('User not found.');

      user.status = newStatus;

      // Update associated entity status
      if (user.role === 'bloodbank') {
        const bank = this.data.bloodBanks.find(b => b.userId === userId);
        if (bank) bank.status = (newStatus === 'active') ? 'verified' : 'pending';
      } else if (user.role === 'donor') {
        const dnr = this.data.donors.find(d => d.userId === userId);
        if (dnr) dnr.verificationStatus = (newStatus === 'active') ? 'verified' : 'pending';
      }

      this.addAuditLog('Admin', 'admin', 'USER_STATUS_CHANGE', `Account ${user.name} (${user.email}) changed to ${newStatus.toUpperCase()}`);
      this.addNotification({
        targetUserId: user.id,
        title: `Account Status: ${newStatus.toUpperCase()}`,
        message: `Your account registration status has been updated to ${newStatus}.`,
        type: newStatus === 'active' ? 'success' : 'warning'
      });

      this.save();
      return user;
    }

    // --- 6. AI-POWERED CLOSEST BLOOD BANK SELECTION ENGINE ---
    /**
     * Determines the most medically appropriate blood bank for an emergency hospital request.
     * Considers:
     * 1. Hospital GPS vs Blood Bank GPS
     * 2. Actual Haversine Distance
     * 3. Estimated Travel Time (min)
     * 4. Blood Group Compatibility & Units Available
     * 5. Operating status (verified only)
     * 6. Urgency weighting
     */
    findBestBloodBankForRequest(request) {
      const hospitalLat = request.hospitalLat;
      const hospitalLng = request.hospitalLng;
      const bloodGroupNeeded = request.bloodGroup;
      const unitsRequired = request.unitsRequired;

      const compatibleGroups = RECIPIENT_COMPATIBILITY[bloodGroupNeeded] || [bloodGroupNeeded];

      // Retrieve all verified blood banks
      const verifiedBanks = this.data.bloodBanks.filter(b => b.status === 'verified');
      if (verifiedBanks.length === 0) {
        return {
          bestBank: null,
          reason: 'No verified blood bank institutions found in registry.',
          alternatives: []
        };
      }

      // Rank candidates
      const rankedBanks = verifiedBanks.map(bank => {
        const distanceKm = getHaversineDistanceKm(hospitalLat, hospitalLng, bank.lat, bank.lng);
        const travelTimeMins = estimateTravelTimeMinutes(distanceKm);

        // Calculate available compatible units
        let totalCompatibleUnits = 0;
        let exactMatchUnits = bank.inventory[bloodGroupNeeded] || 0;

        compatibleGroups.forEach(grp => {
          totalCompatibleUnits += (bank.inventory[grp] || 0);
        });

        const hasExactStock = exactMatchUnits >= unitsRequired;
        const hasCompatibleStock = totalCompatibleUnits >= unitsRequired;

        // Composite Feasibility Score
        // Priority 1: Has exact required units
        // Priority 2: Has compatible units
        // Priority 3: Distance / Travel time penalty
        let score = 0;
        if (hasExactStock) {
          score += 1000;
        } else if (hasCompatibleStock) {
          score += 700;
        } else {
          // Partial fulfillment potential
          score += (totalCompatibleUnits / Math.max(1, unitsRequired)) * 300;
        }

        // Distance factor (closer is higher)
        score -= (distanceKm * 5);

        return {
          bankId: bank.id,
          bankName: bank.name,
          city: bank.city,
          address: bank.address,
          lat: bank.lat,
          lng: bank.lng,
          contact: bank.contact,
          distanceKm: distanceKm,
          travelTimeMins: travelTimeMins,
          exactMatchUnits: exactMatchUnits,
          totalCompatibleUnits: totalCompatibleUnits,
          hasSufficientStock: hasCompatibleStock,
          score: Math.round(score)
        };
      });

      // Sort descending by score
      rankedBanks.sort((a, b) => b.score - a.score);

      const best = rankedBanks[0];
      let reason = '';

      if (best.hasSufficientStock) {
        reason = `Selected ${best.bankName} (${best.distanceKm} km, ~${best.travelTimeMins} mins) because it holds ${best.exactMatchUnits} exact units of ${bloodGroupNeeded} (and ${best.totalCompatibleUnits} compatible units), completely fulfilling the ${unitsRequired} units required with the shortest emergency travel route.`;
      } else {
        reason = `Primary recommendation ${best.bankName} is closest (${best.distanceKm} km), but holds only ${best.totalCompatibleUnits} compatible units (insufficient for ${unitsRequired} units). Escalate to voluntary donor matching or combine multi-center dispatches.`;
      }

      return {
        bestBank: best,
        reason: reason,
        alternatives: rankedBanks.slice(1, 4)
      };
    }

    // --- 7. AI-POWERED PRELIMINARY DONOR ELIGIBILITY SCREENING ---
    evaluatePreliminaryDonorScreening({
      age,
      weight,
      bloodGroup,
      daysSinceLastDonation = 90,
      hasChronicConditions = false,
      takingMedications = false,
      recentIllness = false
    }) {
      const warnings = [];
      const contraindications = [];

      // 1. Age Rule
      if (age < 18) {
        contraindications.push('Donor age is under the legal voluntary blood donation threshold (18 years).');
      } else if (age > 65) {
        contraindications.push('Donor age exceeds the standard whole blood donation age limit (65 years).');
      }

      // 2. Weight Rule
      if (weight < 50) {
        contraindications.push(`Donor weight (${weight} kg) is below the minimum clinical standard of 50 kg.`);
      }

      // 3. Last Donation Recency Rule
      if (daysSinceLastDonation < 56) {
        contraindications.push(`Only ${daysSinceLastDonation} days have elapsed since the previous blood donation. Minimum mandatory recovery period is 56 days (8 weeks).`);
      }

      // 4. Reported Health Conditions
      if (hasChronicConditions) {
        warnings.push('Chronic cardiovascular, pulmonary or metabolic conditions reported. Qualified medical officer review required.');
      }
      if (takingMedications) {
        warnings.push('Active prescription medications reported. Clinical pharmacist cross-matching review required.');
      }
      if (recentIllness) {
        warnings.push('Fever or infectious symptoms reported within the last 14 days. Pre-donation vitals check required.');
      }

      // Categorization
      let status = 'GREEN';
      let summary = '';

      if (contraindications.length > 0) {
        status = 'RED';
        summary = 'Potential eligibility concern: ' + contraindications.join(' ');
      } else if (warnings.length > 0) {
        status = 'YELLOW';
        summary = 'Additional medical screening required: ' + warnings.join(' ');
      } else {
        status = 'GREEN';
        summary = 'No obvious clinical eligibility concerns identified from the provided profile information.';
      }

      return {
        status: status, // GREEN, YELLOW, RED
        notes: summary,
        warnings: warnings,
        contraindications: contraindications,
        evaluatedAt: new Date().toISOString(),
        disclaimer: 'DISCLAIMER: Preliminary AI assessment is for logistical triage only and does NOT replace licensed medical examination, hemoglobin estimation, or transfusion-transmitted infection screening.'
      };
    }

    // --- 8. AI-POWERED DONOR MATCHING ENGINE ---
    rankCompatibleDonorsForRequest(request) {
      const hospitalLat = request.hospitalLat;
      const hospitalLng = request.hospitalLng;
      const bloodGroupNeeded = request.bloodGroup;

      const compatibleGroups = RECIPIENT_COMPATIBILITY[bloodGroupNeeded] || [bloodGroupNeeded];

      // Filter donors
      const candidateDonors = this.data.donors.filter(donor => {
        const isCompatible = compatibleGroups.includes(donor.bloodGroup);
        const isAvailable = donor.availability === 'available';
        const isNotDeferred = donor.screening.status !== 'RED';
        const isVerified = donor.verificationStatus === 'verified';
        return isCompatible && isAvailable && isNotDeferred && isVerified;
      });

      // Weights: Distance 40%, Reliability 30%, Recency 30%
      const Wd = 40;
      const Wr = 30;
      const Wrc = 30;

      const scoredList = candidateDonors.map(donor => {
        const distanceKm = getHaversineDistanceKm(hospitalLat, hospitalLng, donor.lat, donor.lng);
        const travelTimeMins = estimateTravelTimeMinutes(distanceKm);

        // Distance Score: 100 at 0km, 0 at 40km
        const distScore = Math.max(0, 100 - (distanceKm * 2.5));
        const relScore = donor.reliability; // 0 - 100
        const recScore = Math.min(100, Math.max(0, ((donor.daysSinceLastDonation - 56) / (180 - 56)) * 100));

        const compositeScore = Math.round(((Wd * distScore) + (Wr * relScore) + (Wrc * recScore)) / (Wd + Wr + Wrc));

        let reason = `Compatible ${donor.bloodGroup} donor located ${distanceKm} km away (~${travelTimeMins} mins travel). Reliability score: ${donor.reliability}%. ${donor.daysSinceLastDonation} days since previous donation.`;

        return {
          donorId: donor.id,
          name: donor.name,
          bloodGroup: donor.bloodGroup,
          city: donor.city,
          address: donor.address,
          distanceKm: distanceKm,
          travelTimeMins: travelTimeMins,
          reliability: donor.reliability,
          daysSinceLastDonation: donor.daysSinceLastDonation,
          screeningStatus: donor.screening.status,
          matchingScore: compositeScore,
          reason: reason
        };
      });

      // Sort descending by score
      scoredList.sort((a, b) => b.matchingScore - a.matchingScore);
      return scoredList;
    }

    // Run AI Evaluation for all pending/active requests
    evaluateAllPendingRequestsAI() {
      this.data.bloodRequests.forEach(req => {
        if (!req.aiRecommendation || req.status === 'pending' || req.status === 'ai_matching' || req.status === 'awaiting_approval') {
          const bankRec = this.findBestBloodBankForRequest(req);
          const donorMatches = this.rankCompatibleDonorsForRequest(req);

          req.aiRecommendation = {
            recommendedBank: bankRec.bestBank,
            reason: bankRec.reason,
            alternativeBanks: bankRec.alternatives,
            recommendedDonors: donorMatches.slice(0, 5),
            generatedAt: new Date().toISOString()
          };
          if (req.status === 'pending') {
            req.status = 'awaiting_approval';
          }
        }
      });
      this.save();
    }

    // --- BLOOD REQUEST MANAGEMENT ---
    createBloodRequest({ hospitalId, bloodGroup, unitsRequired, urgency, requiredDate, patientRef, additionalNotes }) {
      const hospital = this.data.hospitals.find(h => h.id === hospitalId || h.userId === hospitalId);
      if (!hospital) throw new Error('Hospital entity not found.');

      const reqId = 'REQ-TN-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

      const newRequest = {
        id: reqId,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        hospitalLat: hospital.lat,
        hospitalLng: hospital.lng,
        bloodGroup: bloodGroup,
        unitsRequired: parseInt(unitsRequired, 10),
        urgency: urgency, // normal, urgent, emergency
        requiredDate: requiredDate || new Date().toISOString().split('T')[0],
        patientRef: patientRef || 'N/A',
        additionalNotes: additionalNotes || '',
        status: 'ai_matching',
        createdAt: new Date().toISOString(),
        aiRecommendation: null
      };

      // Perform AI Recommendations immediately
      const bankRec = this.findBestBloodBankForRequest(newRequest);
      const donorMatches = this.rankCompatibleDonorsForRequest(newRequest);

      newRequest.aiRecommendation = {
        recommendedBank: bankRec.bestBank,
        reason: bankRec.reason,
        alternativeBanks: bankRec.alternatives,
        recommendedDonors: donorMatches.slice(0, 5),
        generatedAt: new Date().toISOString()
      };

      newRequest.status = 'awaiting_approval';

      this.data.bloodRequests.unshift(newRequest);

      // Create Notifications & Audit
      this.addAuditLog(hospital.name, 'hospital', 'CREATE_BLOOD_REQUEST', `Submitted ${urgency.toUpperCase()} request for ${unitsRequired} units of ${bloodGroup} (Ticket ${reqId})`);
      this.addNotification({
        targetRole: 'admin',
        title: `🚨 ${urgency.toUpperCase()} Blood Request Created`,
        message: `${hospital.name} requires ${unitsRequired} units of ${bloodGroup}. AI has matched recommended sources.`,
        type: urgency === 'emergency' ? 'alert' : 'info'
      });

      this.save();
      return newRequest;
    }

    approveRequestAIRecommendation(requestId, selectedBankId = null) {
      const request = this.data.bloodRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found.');

      const bankId = selectedBankId || (request.aiRecommendation && request.aiRecommendation.recommendedBank ? request.aiRecommendation.recommendedBank.bankId : null);
      if (!bankId) throw new Error('No valid blood bank selected.');

      const bank = this.data.bloodBanks.find(b => b.id === bankId);
      if (!bank) throw new Error('Blood bank not found in system.');

      request.status = 'bank_matching';
      request.adminApproval = {
        status: 'approved',
        approvedBankId: bank.id,
        approvedBankName: bank.name,
        approvedAt: new Date().toISOString()
      };

      // Notify the blood bank
      this.addNotification({
        targetRole: 'bloodbank',
        targetUserId: bank.userId,
        title: `Priority Dispatch Order: ${request.bloodGroup}`,
        message: `State Admin approved emergency order: Transfer ${request.unitsRequired} units of ${request.bloodGroup} to ${request.hospitalName}.`,
        type: 'alert'
      });

      // Notify the hospital
      this.addNotification({
        targetRole: 'hospital',
        targetUserId: request.hospitalId,
        title: `Blood Bank Allocation Approved`,
        message: `Admin approved allocation from ${bank.name}. Blood bank is preparing transit.`,
        type: 'success'
      });

      this.addAuditLog('State Admin', 'admin', 'APPROVE_RECOMMENDATION', `Approved ${bank.name} for request ${request.id}.`);
      this.save();
      return request;
    }

    fulfillRequest(requestId, fulfilledByText) {
      const request = this.data.bloodRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found.');

      request.status = 'fulfilled';
      request.fulfilledBy = fulfilledByText || 'Fulfillment confirmed by medical center';
      request.fulfilledAt = new Date().toISOString();

      this.addAuditLog('System Fulfillment', 'admin', 'REQUEST_FULFILLED', `Request ${request.id} fulfilled: ${request.fulfilledBy}`);
      this.save();
      return request;
    }

    // --- INVENTORY MANAGEMENT (WITH TRANSACTION SAFEGUARD) ---
    updateBloodBankInventory(bankId, bloodGroup, changeUnits, reason = 'Routine Stock Adjustment') {
      const bank = this.data.bloodBanks.find(b => b.id === bankId || b.userId === bankId);
      if (!bank) throw new Error('Blood Bank not found.');

      const current = bank.inventory[bloodGroup] || 0;
      const updated = Math.max(0, current + changeUnits);
      bank.inventory[bloodGroup] = updated;
      bank.lastInventoryUpdate = new Date().toISOString();

      // Record transaction ledger entry
      this.data.inventoryTransactions.unshift({
        id: 'TXN-' + Date.now(),
        bankId: bank.id,
        bankName: bank.name,
        bloodGroup: bloodGroup,
        units: Math.abs(changeUnits),
        type: changeUnits >= 0 ? 'addition' : 'deduction',
        reason: reason,
        timestamp: new Date().toISOString()
      });

      this.addAuditLog(bank.name, 'bloodbank', 'INVENTORY_UPDATE', `${changeUnits >= 0 ? '+' : ''}${changeUnits} units of ${bloodGroup}. New total: ${updated}`);
      
      // Re-evaluate pending requests with updated inventory
      this.evaluateAllPendingRequestsAI();

      this.save();
      return bank;
    }

    // --- NOTIFICATIONS & AUDITS ---
    addNotification({ targetRole = null, targetUserId = null, title, message, type = 'info' }) {
      this.data.notifications.unshift({
        id: 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 100),
        targetRole: targetRole,
        targetUserId: targetUserId,
        title: title,
        message: message,
        type: type,
        isRead: false,
        timestamp: new Date().toISOString()
      });
      this.save();
    }

    addAuditLog(actor, role, action, details) {
      this.data.auditLogs.unshift({
        id: 'AUD-' + Date.now(),
        timestamp: new Date().toISOString(),
        actor: actor,
        role: role,
        action: action,
        details: details
      });
      // Keep ledger within 200 items for performance
      if (this.data.auditLogs.length > 200) {
        this.data.auditLogs.length = 200;
      }
      this.save();
    }

    // --- CSV EXPORTER ---
    exportToCSV(reportType) {
      let rows = [];
      let filename = `blood_coop_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

      if (reportType === 'requests') {
        rows.push(['Request ID', 'Hospital', 'Blood Group', 'Units', 'Urgency', 'Status', 'Created At', 'Fulfilled By']);
        this.data.bloodRequests.forEach(r => {
          rows.push([r.id, r.hospitalName, r.bloodGroup, r.unitsRequired, r.urgency, r.status, r.createdAt, r.fulfilledBy || '']);
        });
      } else if (reportType === 'inventory') {
        rows.push(['Blood Bank Name', 'City', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Last Updated']);
        this.data.bloodBanks.forEach(b => {
          rows.push([
            b.name, b.city,
            b.inventory['A+'] || 0, b.inventory['A-'] || 0,
            b.inventory['B+'] || 0, b.inventory['B-'] || 0,
            b.inventory['AB+'] || 0, b.inventory['AB-'] || 0,
            b.inventory['O+'] || 0, b.inventory['O-'] || 0,
            b.lastInventoryUpdate
          ]);
        });
      } else if (reportType === 'donors') {
        rows.push(['Donor ID', 'Name', 'Blood Group', 'City', 'Phone', 'Availability', 'Screening Status', 'Reliability', 'Total Donations']);
        this.data.donors.forEach(d => {
          rows.push([d.id, d.name, d.bloodGroup, d.city, d.phone, d.availability, d.screening.status, `${d.reliability}%`, d.totalDonations]);
        });
      } else if (reportType === 'audit') {
        rows.push(['Timestamp', 'Actor', 'Role', 'Action', 'Details']);
        this.data.auditLogs.forEach(a => {
          rows.push([a.timestamp, a.actor, a.role, a.action, `"${a.details.replace(/"/g, '""')}"`]);
        });
      }

      const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Export to global window object
  window.CentralBloodDB = new CentralBloodDB();
  window.hashPassword = hashPassword;
  window.ALL_BLOOD_GROUPS = ALL_BLOOD_GROUPS;
  window.RECIPIENT_COMPATIBILITY = RECIPIENT_COMPATIBILITY;

})(window);
