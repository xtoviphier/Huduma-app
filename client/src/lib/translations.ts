export const translations = {
  en: {
    // Header
    appName: "Huduma",
    tagline: "Connecting You to Skilled Professionals",
    
    // Navigation
    home: "Home",
    search: "Search",
    saved: "Saved",
    messages: "Messages",
    profile: "Profile",
    
    // Home page
    heroTitle: "Find Trusted Service Providers Near You",
    heroSubtitle: "Connect with skilled professionals in Mombasa for all your service needs",
    searchPlaceholder: "What service do you need?",
    popularServices: "Popular Services",
    nearbyProviders: "Nearby Providers",
    viewAll: "View All",
    
    // Service categories
    plumbing: "Plumbing",
    electrical: "Electrical Work",
    carpentry: "Carpentry",
    mobileRepair: "Mobile Repair",
    hairdressing: "Hairdressing",
    gardening: "Gardening",
    houseCleaning: "House Cleaning",
    masonry: "Masonry",
    
    // Provider info
    yearsExperience: "years exp",
    kmAway: "km away",
    contact: "Contact",
    
    // How it works
    howItWorks: "How It Works",
    step1Title: "1. Search & Browse",
    step1Description: "Find skilled service providers near you based on your location and service needs.",
    step2Title: "2. Connect & Book",
    step2Description: "Review profiles, read reviews, and connect with your preferred service provider.",
    step3Title: "3. Pay Securely",
    step3Description: "Pay safely through the app using M-Pesa after your service is completed.",
    
    // Booking
    bookService: "Book Service",
    serviceDescription: "Service Description",
    describeNeeds: "Describe your service needs...",
    preferredDateTime: "Preferred Date & Time",
    estimatedBudget: "Estimated Budget",
    sendRequest: "Send Request",
    
    // Chat
    typeMessage: "Type a message...",
    jobAccepted: "Job Accepted",
    
    // Dashboard
    yourDashboard: "Your Dashboard",
    jobsCompleted: "Jobs Completed",
    averageRating: "Average Rating",
    savedProviders: "Saved Providers",
    activeJobs: "Active Jobs",
    recentJobs: "Recent Jobs",
    completed: "Completed",
    inProgress: "In Progress",
    
    // Payment
    securePayment: "Secure Payment",
    serviceCost: "Service Cost",
    appFee: "App Fee",
    total: "Total",
    payWithMpesa: "Pay with M-Pesa",
    paymentSecure: "Your payment is secure and protected",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    next: "Next",
    providers: "providers",
  },
  
  sw: {
    // Header
    appName: "Huduma",
    tagline: "Tunakupa Uhakika wa Wafanyakazi Wako",
    
    // Navigation
    home: "Nyumbani",
    search: "Tafuta",
    saved: "Zilizohifadhiwa",
    messages: "Ujumbe",
    profile: "Wasifu",
    
    // Home page
    heroTitle: "Pata Watoa Huduma Waaminifu Karibu Nawe",
    heroSubtitle: "Unganisha na wataalamu wenye ujuzi huko Mombasa kwa mahitaji yako yote ya huduma",
    searchPlaceholder: "Unahitaji huduma gani?",
    popularServices: "Huduma Maarufu",
    nearbyProviders: "Watoa Huduma Karibu",
    viewAll: "Ona Zote",
    
    // Service categories
    plumbing: "Mipamili",
    electrical: "Kazi za Umeme",
    carpentry: "Useremala",
    mobileRepair: "Kukarabati Simu",
    hairdressing: "Kunyoa Nywele",
    gardening: "Bustani",
    houseCleaning: "Kusafisha Nyumba",
    masonry: "Ujenzi",
    
    // Provider info
    yearsExperience: "miaka uzoefu",
    kmAway: "km mbali",
    contact: "Wasiliana",
    
    // How it works
    howItWorks: "Jinsi Inavyofanya Kazi",
    step1Title: "1. Tafuta na Vinjari",
    step1Description: "Pata watoa huduma wenye ujuzi karibu nawe kulingana na eneo lako na mahitaji ya huduma.",
    step2Title: "2. Unganisha na Uweke Oda",
    step2Description: "Pitia wasifu, soma maoni, na unganisha na mtoa huduma unayependelea.",
    step3Title: "3. Lipa Kwa Usalama",
    step3Description: "Lipa kwa usalama kupitia programu kwa kutumia M-Pesa baada ya huduma yako kukamilika.",
    
    // Booking
    bookService: "Weka Oda ya Huduma",
    serviceDescription: "Maelezo ya Huduma",
    describeNeeds: "Eleza mahitaji yako ya huduma...",
    preferredDateTime: "Tarehe na Wakati Unaopendelea",
    estimatedBudget: "Bajeti Inayokadiriwa",
    sendRequest: "Tuma Ombi",
    
    // Chat
    typeMessage: "Andika ujumbe...",
    jobAccepted: "Kazi Imekubaliwa",
    
    // Dashboard
    yourDashboard: "Dashibodi Yako",
    jobsCompleted: "Kazi Zilizokamilika",
    averageRating: "Kiwango cha Wastani",
    savedProviders: "Watoa Huduma Waliohifadhiwa",
    activeJobs: "Kazi za Sasa",
    recentJobs: "Kazi za Hivi Karibuni",
    completed: "Imekamilika",
    inProgress: "Inaendelea",
    
    // Payment
    securePayment: "Malipo Salama",
    serviceCost: "Gharama ya Huduma",
    appFee: "Ada ya Programu",
    total: "Jumla",
    payWithMpesa: "Lipa kwa M-Pesa",
    paymentSecure: "Malipo yako ni salama na yanalindwa",
    
    // Common
    loading: "Inapakia...",
    error: "Hitilafu",
    success: "Mafanikio",
    cancel: "Ghairi",
    save: "Hifadhi",
    edit: "Hariri",
    delete: "Futa",
    back: "Rudi",
    next: "Ifuatayo",
    providers: "watoa huduma",
  },
};

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;
