import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

// Form field configuration for validation rules
const FIELD_CONFIG = {
  name: { required: true, minLength: 2, maxLength: 100, label: "Full Name" },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: "Email Address" },
  phone: { required: true, minLength: 10, maxLength: 15, label: "Phone Number" },
  position: { required: true, label: "Position" },
  college: { required: true, minLength: 2, label: "University / College" },
  degree: { required: true, minLength: 2, maxLength: 100, label: "Degree / Course" },
  resume: { required: true, label: "CV / Resume" }
};

const POSITIONS = [
  { value: "Frontend Developer", label: "Frontend Developer", category: "Engineering" },
  { value: "Backend Developer", label: "Backend Developer", category: "Engineering" },
  { value: "Full Stack Developer", label: "Full Stack Developer", category: "Engineering" },
  { value: "UI/UX Designer", label: "UI/UX Designer", category: "Design" },
  { value: "Data Analyst", label: "Data Analyst", category: "Data" },
  { value: "DevOps Engineer", label: "DevOps Engineer", category: "Engineering" },
  { value: "Business Development Executive", label: "Business Development Executive", category: "Business" },
  { value: "HR Intern", label: "HR Intern", category: "HR" },
  { value: "Marketing Intern", label: "Marketing Intern", category: "Marketing" },
  { value: "Software Testing Intern", label: "Software Testing Intern", category: "Engineering" }
];

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  phone: "",
  country: "",
  college: "",
  degree: "",
  position: "",
  experience: "",
  resume: null,
  resumeFileName: "",
  github: "",
  linkedin: "",
  coverLetter: ""
};

// University data - comprehensive list
const UNIVERSITIES = [
  // India - IITs
  { name: "Indian Institute of Technology (IIT) Bombay", country: "India" },
  { name: "Indian Institute of Technology (IIT) Delhi", country: "India" },
  { name: "Indian Institute of Technology (IIT) Madras", country: "India" },
  { name: "Indian Institute of Technology (IIT) Kanpur", country: "India" },
  { name: "Indian Institute of Technology (IIT) Kharagpur", country: "India" },
  { name: "Indian Institute of Technology (IIT) Roorkee", country: "India" },
  { name: "Indian Institute of Technology (IIT) Guwahati", country: "India" },
  { name: "Indian Institute of Technology (IIT) Hyderabad", country: "India" },
  { name: "Indian Institute of Technology (IIT) Indore", country: "India" },
  { name: "Indian Institute of Technology (IIT) Jodhpur", country: "India" },
  { name: "Indian Institute of Technology (IIT) Patna", country: "India" },
  { name: "Indian Institute of Technology (IIT) Bhubaneswar", country: "India" },
  { name: "Indian Institute of Technology (IIT) Gandhinagar", country: "India" },
  { name: "Indian Institute of Technology (IIT) Mandi", country: "India" },
  { name: "Indian Institute of Technology (IIT) Tirupati", country: "India" },
  { name: "Indian Institute of Technology (IIT) Dhanbad (ISM)", country: "India" },
  { name: "Indian Institute of Science (IISc) Bangalore", country: "India" },
  { name: "National Institute of Technology (NIT) Trichy", country: "India" },
  { name: "National Institute of Technology (NIT) Warangal", country: "India" },
  { name: "National Institute of Technology (NIT) Surathkal", country: "India" },
  { name: "National Institute of Technology (NIT) Calicut", country: "India" },
  { name: "BITS Pilani", country: "India" },
  { name: "VIT University Vellore", country: "India" },
  { name: "SRM Institute of Science and Technology", country: "India" },
  { name: "Lovely Professional University", country: "India" },
  { name: "Anna University", country: "India" },
  { name: "Jadavpur University", country: "India" },
  { name: "University of Delhi", country: "India" },
  { name: "University of Mumbai", country: "India" },
  { name: "University of Calcutta", country: "India" },
  { name: "Panjab University Chandigarh", country: "India" },
  { name: "Jamia Millia Islamia", country: "India" },
  // USA
  { name: "Harvard University", country: "USA" },
  { name: "Massachusetts Institute of Technology (MIT)", country: "USA" },
  { name: "Stanford University", country: "USA" },
  { name: "Yale University", country: "USA" },
  { name: "Princeton University", country: "USA" },
  { name: "Columbia University", country: "USA" },
  { name: "University of Chicago", country: "USA" },
  { name: "University of Pennsylvania", country: "USA" },
  { name: "Johns Hopkins University", country: "USA" },
  { name: "Duke University", country: "USA" },
  { name: "Cornell University", country: "USA" },
  { name: "University of California Berkeley (UC Berkeley)", country: "USA" },
  { name: "University of California Los Angeles (UCLA)", country: "USA" },
  { name: "University of Michigan Ann Arbor", country: "USA" },
  { name: "University of Texas at Austin", country: "USA" },
  { name: "New York University (NYU)", country: "USA" },
  { name: "Carnegie Mellon University", country: "USA" },
  { name: "Georgia Institute of Technology", country: "USA" },
  { name: "University of Illinois Urbana-Champaign", country: "USA" },
  { name: "Purdue University", country: "USA" },
  // UK
  { name: "University of Oxford", country: "UK" },
  { name: "University of Cambridge", country: "UK" },
  { name: "Imperial College London", country: "UK" },
  { name: "University College London (UCL)", country: "UK" },
  { name: "London School of Economics (LSE)", country: "UK" },
  { name: "University of Edinburgh", country: "UK" },
  { name: "University of Manchester", country: "UK" },
  { name: "King's College London", country: "UK" },
  { name: "University of Bristol", country: "UK" },
  { name: "University of Warwick", country: "UK" },
  // Canada
  { name: "University of Toronto", country: "Canada" },
  { name: "University of British Columbia (UBC)", country: "Canada" },
  { name: "McGill University", country: "Canada" },
  { name: "University of Alberta", country: "Canada" },
  { name: "McMaster University", country: "Canada" },
  { name: "University of Waterloo", country: "Canada" },
  { name: "Western University", country: "Canada" },
  { name: "Queen's University", country: "Canada" },
  // Australia
  { name: "University of Melbourne", country: "Australia" },
  { name: "Australian National University (ANU)", country: "Australia" },
  { name: "University of Sydney", country: "Australia" },
  { name: "University of Queensland", country: "Australia" },
  { name: "University of New South Wales (UNSW)", country: "Australia" },
  { name: "Monash University", country: "Australia" },
  // Germany
  { name: "Technical University of Munich (TUM)", country: "Germany" },
  { name: "Ludwig Maximilian University Munich (LMU)", country: "Germany" },
  { name: "Heidelberg University", country: "Germany" },
  { name: "Humboldt University Berlin", country: "Germany" },
  { name: "RWTH Aachen University", country: "Germany" },
  // France
  { name: "École Polytechnique", country: "France" },
  { name: "Sorbonne University", country: "France" },
  { name: "HEC Paris", country: "France" },
  // Singapore
  { name: "National University of Singapore (NUS)", country: "Singapore" },
  { name: "Nanyang Technological University (NTU)", country: "Singapore" },
  { name: "Singapore Management University (SMU)", country: "Singapore" },
  // UAE
  { name: "University of Dubai", country: "UAE" },
  { name: "American University of Dubai (AUD)", country: "UAE" },
  { name: "Khalifa University", country: "UAE" },
  // Other universities will be added dynamically
];

// Add common Indian universities
const INDIAN_UNIVERSITIES = [
  "University of Delhi", "University of Mumbai", "University of Calcutta", "University of Madras",
  "Anna University", "Osmania University", "Savitribai Phule Pune University",
  "Banaras Hindu University (BHU)", "Aligarh Muslim University", "University of Hyderabad",
  "Jadavpur University", "NIT Trichy", "NIT Warangal", "NIT Surathkal", "NIT Calicut",
  "NIT Rourkela", "NIT Allahabad (MNNIT)", "NIT Durgapur", "NIT Jamshedpur",
  "NIT Kurukshetra", "NIT Silchar", "NIT Surat (SVNIT)", "NIT Bhopal (MANIT)",
  "NIT Nagpur (VNIT)", "NIT Hamirpur", "NIT Jalandhar", "BITS Pilani",
  "BITS Pilani Goa Campus", "BITS Pilani Hyderabad Campus", "VIT University Vellore",
  "VIT Chennai", "VIT Bhopal", "Amity University Noida", "Amity University Mumbai",
  "Manipal Academy of Higher Education", "SRM Institute of Science and Technology",
  "SRM University Kattankulathur", "Lovely Professional University", "Chandigarh University",
  "Christ University Bangalore", "Symbiosis International University",
  "Tata Institute of Social Sciences (TISS)", "Jamia Millia Islamia",
  "Shiv Nadar University", "Ashoka University", "OP Jindal Global University",
  "Thapar Institute of Engineering & Technology", "PSG College of Technology",
  "Coimbatore Institute of Technology", "College of Engineering Pune (COEP)",
  "IIIT Hyderabad", "IIIT Bangalore", "IIIT Delhi", "IIIT Allahabad",
  "Guru Gobind Singh Indraprastha University", "University of Rajasthan",
  "University of Lucknow", "Panjab University Chandigarh", "University of Allahabad",
  "Gujarat University", "Maharaja Sayajirao University of Baroda",
  "R.V. College of Engineering Bangalore", "BMS College of Engineering Bangalore",
  "M.S. Ramaiah Institute of Technology", "Dayananda Sagar University",
  "PES University Bangalore", "Jain University Bangalore", "Reva University",
  "New Horizon College of Engineering", "Bangalore Institute of Technology",
  "Pune Institute of Computer Technology (PICT)", "Vishwakarma Institute of Technology Pune",
  "MIT World Peace University", "Dr. D. Y. Patil University",
  "KLE Technological University", "Visvesvaraya Technological University (VTU)",
  "Mysore University", "Karnataka State Open University", "Kerala University",
  "Cochin University of Science and Technology (CUSAT)", "Calicut University",
  "Mahatma Gandhi University Kottayam", "APJ Abdul Kalam Technological University",
  "University of Kashmir", "Jammu University", "Himachal Pradesh University",
  "Dibrugarh University", "Gauhati University", "Tezpur University",
  "University of Karachi", "Quaid-i-Azam University Islamabad",
  "University of Punjab Lahore", "NUST (National University of Sciences & Technology)",
  "LUMS (Lahore University of Management Sciences)", "IBA Karachi",
  "University of Dhaka", "Bangladesh University of Engineering & Technology (BUET)",
  "Rajshahi University", "Chittagong University", "BRAC University", "North South University",
  "Tribhuvan University", "Kathmandu University", "Pokhara University",
  "University of Malaya (UM)", "Universiti Teknologi Malaysia (UTM)",
  "Universiti Putra Malaysia (UPM)", "Universiti Sains Malaysia (USM)",
  "University of Indonesia (UI)", "Bandung Institute of Technology (ITB)",
  "Gadjah Mada University (UGM)", "University of Tokyo", "Kyoto University",
  "Osaka University", "Tokyo Institute of Technology", "Tohoku University",
  "Nagoya University", "Kyushu University", "Hokkaido University",
  "Keio University", "Waseda University", "Seoul National University",
  "KAIST (Korea Advanced Institute of Science and Technology)",
  "Yonsei University", "Korea University", "Sungkyunkwan University (SKKU)",
  "ETH Zurich", "EPFL (École Polytechnique Fédérale de Lausanne)",
  "University of Zurich", "University of Basel", "Delft University of Technology",
  "University of Amsterdam", "Leiden University", "Eindhoven University of Technology",
  "Karolinska Institute", "KTH Royal Institute of Technology", "Lund University",
  "University of Bologna", "Sapienza University of Rome", "University of Milan",
  "Politecnico di Milano", "University of Turin", "University of Florence",
  "University of Barcelona", "Autonomous University of Madrid",
  "Complutense University of Madrid", "University of Valencia", "University of Seville"
];

// Add Indian universities to the main list
INDIAN_UNIVERSITIES.forEach(name => {
  if (!UNIVERSITIES.find(u => u.name === name)) {
    UNIVERSITIES.push({ name, country: "India" });
  }
});

// Extract unique countries
const COUNTRIES = [...new Set(UNIVERSITIES.map(u => u.country))].sort();

// Storage key for form persistence
const STORAGE_KEY = 'internship_apply_form';

export default function InternshipApply({ internship: propInternship }) {
  const { user, token } = useAuth();
  const location = useLocation();
  // Use prop internship first, then fall back to location state
  const internship = propInternship || location.state?.internship;
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationType, setApplicationType] = useState("internship");
  const [universitySearch, setUniversitySearch] = useState("");
  const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
  const universityDropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (universityDropdownRef.current && !universityDropdownRef.current.contains(event.target)) {
        setIsUniversityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load persisted form data on mount
  useEffect(() => {
    const savedForm = localStorage.getItem(STORAGE_KEY);
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        // Only restore non-file fields
        setForm(prev => ({
          ...prev,
          ...parsed,
          resume: null, // Don't restore file objects
          resumeFileName: parsed.resumeFileName || ""
        }));
      } catch (e) {
        console.error("Error loading saved form:", e);
      }
    }
  }, []);

  // Persist form data to localStorage
  useEffect(() => {
    const fieldsToSave = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      country: form.country,
      college: form.college,
      degree: form.degree,
      position: form.position,
      experience: form.experience,
      resumeFileName: form.resumeFileName,
      github: form.github,
      linkedin: form.linkedin,
      coverLetter: form.coverLetter,
      applicationType: applicationType
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fieldsToSave));
  }, [form, applicationType]);

  // Pre-fill user data from AuthContext
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.username || user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Pre-fill form with internship data when provided
  useEffect(() => {
    if (internship) {
      setForm(prev => ({
        ...prev,
        position: internship.role || prev.position
      }));
    }
  }, [internship]);

  // Fetch user's applications
  const fetchApplications = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await api.get("/api/lms/my-applications");
      setUserApplications(res.data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  }, [token]);

  // Fetch available internships
  const fetchInternships = useCallback(async () => {
    try {
      const res = await api.get("/api/lms/internships");
      // Store internships if needed for future use
      return res.data.internships || [];
    } catch (error) {
      console.error("Error fetching internships:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Filter universities based on search and country
  const filteredUniversities = UNIVERSITIES.filter(uni => {
    const matchesCountry = form.country ? uni.country === form.country : true;
    const matchesSearch = universitySearch.length >= 1
      ? uni.name.toLowerCase().includes(universitySearch.toLowerCase())
      : true;
    return matchesCountry && matchesSearch;
  }).slice(0, 50);

  // Get university count for selected country
  const getUniversityCount = () => {
    if (form.country) {
      return UNIVERSITIES.filter(u => u.country === form.country).length;
    }
    return UNIVERSITIES.length;
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handle country selection
  const handleCountryChange = (country) => {
    setForm(prev => ({ ...prev, country, college: "" }));
    setUniversitySearch("");
  };

  // Handle university selection
  const handleUniversitySelect = (university) => {
    handleFieldChange("college", university.name);
    setUniversitySearch(university.name);
    setIsUniversityDropdownOpen(false);
  };

  // Handle file upload for resume
  const handleFileUpload = async (file) => {
    if (!file) return null;

    // Check if user is authenticated
    if (!token) {
      toast.error("Please log in to upload files.");
      return null;
    }

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.some(type => fileName.endsWith(type));
    
    if (!isValidType) {
      setErrors(prev => ({ ...prev, resume: "Please upload a PDF, DOC, or DOCX file" }));
      return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: "File size must be less than 5MB" }));
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'resume');

      // Fixed: Use correct endpoint path /api/upload/upload
      const res = await api.post("/api/upload/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Handle the response format from backend: { success: true, file: {...} }
      if (res.data && res.data.success && res.data.file) {
        const fileInfo = res.data.file;
        // Update form with file info - properly mapping backend response
        handleFieldChange("resume", {
          fileName: fileInfo.originalName || file.name,
          path: fileInfo.path || fileInfo.url || "",
          url: fileInfo.url || ""
        });
        handleFieldChange("resumeFileName", fileInfo.originalName || file.name);
        
        return {
          fileName: fileInfo.originalName || file.name,
          path: fileInfo.path || fileInfo.url || "",
          url: fileInfo.url || ""
        };
      } else {
        throw new Error(res.data?.error || 'Upload failed');
      }
    } catch (error) {
      console.error("Upload error:", error);
      // If upload fails, just store the filename locally
      handleFieldChange("resumeFileName", file.name);
      handleFieldChange("resume", { fileName: file.name, path: file.name });
      toast.error("Upload failed. Application can still be submitted.");
      return { fileName: file.name, path: file.name };
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(FIELD_CONFIG).forEach(field => {
      const config = FIELD_CONFIG[field];
      const value = form[field];
      
      if (config.required && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[field] = `${config.label} is required`;
        return;
      }
      
      if (value && typeof value === 'string') {
        if (config.minLength && value.length < config.minLength) {
          newErrors[field] = `${config.label} must be at least ${config.minLength} characters`;
        }
        if (config.maxLength && value.length > config.maxLength) {
          newErrors[field] = `${config.label} must be less than ${config.maxLength} characters`;
        }
        if (config.pattern && !config.pattern.test(value)) {
          if (field === 'email') {
            newErrors[field] = "Please enter a valid email address";
          }
        }
      }
    });

    // Phone validation - allow various formats
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)";
    }

    // GitHub validation
    if (form.github && !form.github.match(/^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$/i)) {
      newErrors.github = "Please enter a valid GitHub profile URL";
    }

    // LinkedIn validation
    if (form.linkedin && !form.linkedin.match(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i)) {
      newErrors.linkedin = "Please enter a valid LinkedIn profile URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    
    // Check if user is authenticated
    if (!token) {
      const errorMessage = "Please log in to submit your application.";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
      window.location.href = '/login';
      return;
    }
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate unique internship ID based on position
      const internshipId = `gj-${Date.now()}-${form.position.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Properly map form data to match backend model
      const applicationData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        college: form.college,
        degree: form.degree,
        experience: form.experience,
        // Resume - handle both uploaded file and local fallback
        resume: form.resume?.fileName || form.resumeFileName || "",
        resumePath: form.resume?.path || form.resume?.url || "",
        github: form.github,
        linkedin: form.linkedin,
        coverLetter: form.coverLetter,
        applyType: applicationType,
        position: form.position // Include position in applicationData
      };

      const res = await api.post("/api/lms/apply-internship", {
        internshipId,
        role: form.position, // Backend expects 'role' not 'position'
        company: 'GJ Global Services',
        applicationData
      });
      
      if (res.data) {
        setIsSubmitted(true);
        setSubmitSuccess(res.data);
        // Clear persisted form data on successful submission
        localStorage.removeItem(STORAGE_KEY);
        // Refresh applications list
        fetchApplications();
        toast.success("Application submitted successfully!");
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit application. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setForm(INITIAL_FORM_STATE);
    setErrors({});
    setIsSubmitted(false);
    setUniversitySearch("");
    setSubmitError("");
    setSubmitSuccess(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Get status badge color
  const getStatusBadgeStyle = (status) => {
    const styles = {
      pending: { bg: '#fff3e0', color: '#e65100', label: 'Pending' },
      reviewing: { bg: '#e3f2fd', color: '#1565c0', label: 'Reviewing' },
      accepted: { bg: '#e8f5e9', color: '#2e7d32', label: 'Accepted' },
      rejected: { bg: '#ffebee', color: '#c62828', label: 'Rejected' }
    };
    return styles[status] || styles.pending;
  };

  // If submitted, show success message
  if (isSubmitted) {
    return (
      <SuccessScreen 
        form={form}
        applicationType={applicationType}
        applications={userApplications}
        showApplications={showApplications}
        setShowApplications={setShowApplications}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="internship-apply-container">
      <div className="internship-apply-wrapper">
        {/* Header */}
        <Header />

        {/* Form Card */}
        <div className="internship-form-card">
          <FormHeader applicationType={applicationType} internship={internship} />

          {/* Application Type Toggle */}
          <ApplicationTypeToggle 
            applicationType={applicationType}
            setApplicationType={setApplicationType}
          />

          {/* Main Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              {/* Personal Information */}
              <FormField 
                label="Full Name *" 
                name="name"
                error={errors.name}
                required
              >
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={errors.name ? "error" : ""}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
              </FormField>

              <FormField 
                label="Email Address *" 
                name="email"
                error={errors.email}
                required
              >
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  className={errors.email ? "error" : ""}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </FormField>

              <FormField 
                label="Phone Number *" 
                name="phone"
                error={errors.phone}
                required
              >
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  maxLength={15}
                  className={errors.phone ? "error" : ""}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
              </FormField>

              <FormField 
                label="Apply Position *" 
                name="position"
                error={errors.position}
                required
              >
                <select
                  name="position"
                  value={form.position}
                  onChange={(e) => handleFieldChange("position", e.target.value)}
                  className={errors.position ? "error" : ""}
                  aria-invalid={!!errors.position}
                >
                  <option value="">-- Select Position --</option>
                  {POSITIONS.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Country Selection */}
              <div className="full-width">
                <FormField 
                  label="Country" 
                  name="country"
                  error={null}
                >
                  <select
                    name="country"
                    value={form.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                  >
                    <option value="">-- All Countries ({getUniversityCount()} universities) --</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>
                        {c} ({UNIVERSITIES.filter(u => u.country === c).length})
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* University Selection */}
              <div className="full-width" ref={universityDropdownRef}>
                <FormField 
                  label="University / College *" 
                  name="college"
                  error={errors.college}
                  required
                >
                  <div className="university-dropdown">
                    <input
                      type="text"
                      name="college"
                      value={universitySearch}
                      onChange={(e) => {
                        setUniversitySearch(e.target.value);
                        setIsUniversityDropdownOpen(true);
                        if (!e.target.value) handleFieldChange("college", "");
                      }}
                      onFocus={() => setIsUniversityDropdownOpen(true)}
                      placeholder={
                        form.country
                          ? `Search ${getUniversityCount()} universities in ${form.country}...`
                          : `Search ${getUniversityCount()} universities from ${COUNTRIES.length} countries...`
                      }
                      className={errors.college ? "error" : ""}
                      aria-invalid={!!errors.college}
                      aria-expanded={isUniversityDropdownOpen}
                      aria-autocomplete="list"
                    />
                    <span className="dropdown-icon">
                      {form.college ? "✓" : "🔍"}
                    </span>

                    {/* Dropdown */}
                    {isUniversityDropdownOpen && (
                      <div className="dropdown-menu" role="listbox">
                        {filteredUniversities.length === 0 ? (
                          <div className="dropdown-empty">
                            No match found - you can type your college name manually
                          </div>
                        ) : (
                          <>
                            <div className="dropdown-header">
                              {filteredUniversities.length} result{filteredUniversities.length !== 1 ? "s" : ""}
                              {form.country ? ` in ${form.country}` : " worldwide"}
                            </div>
                            {filteredUniversities.map((uni, index) => (
                              <div
                                key={index}
                                className={`dropdown-item ${form.college === uni.name ? "selected" : ""}`}
                                onClick={() => handleUniversitySelect(uni)}
                                role="option"
                                aria-selected={form.college === uni.name}
                              >
                                <div className="uni-name">{uni.name}</div>
                                {!form.country && <div className="uni-country">🌍 {uni.country}</div>}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="field-hint">
                    {form.college
                      ? `✓ Selected: ${form.college}`
                      : form.country
                        ? `💡 Browse ${getUniversityCount()} universities in ${form.country}`
                        : "💡 Select a country to filter, or type any university name"}
                  </div>
                </FormField>
              </div>

              <FormField 
                label="Degree / Course *" 
                name="degree"
                error={errors.degree}
                required
              >
                <input
                  type="text"
                  name="degree"
                  value={form.degree}
                  onChange={(e) => handleFieldChange("degree", e.target.value)}
                  placeholder="e.g., B.Tech, BCA, MBA, B.Sc"
                  className={errors.degree ? "error" : ""}
                  aria-invalid={!!errors.degree}
                />
              </FormField>

              <FormField 
                label="Experience" 
                name="experience"
                error={null}
              >
                <select
                  name="experience"
                  value={form.experience}
                  onChange={(e) => handleFieldChange("experience", e.target.value)}
                >
                  <option value="">-- Select Experience --</option>
                  <option value="fresher">Fresher (0 years)</option>
                  <option value="0-1">0–1 Year</option>
                  <option value="1-2">1–2 Years</option>
                  <option value="2-4">2–4 Years</option>
                  <option value="4+">4+ Years</option>
                </select>
              </FormField>

              {/* Resume Upload */}
              <div className="full-width">
                <FormField 
                  label="Upload CV / Resume *" 
                  name="resume"
                  error={errors.resume}
                  required
                >
                  <div className={`file-upload ${errors.resume ? "error" : ""} ${form.resumeFileName ? "has-file" : ""}`}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(file);
                      }}
                      disabled={isUploading}
                      aria-label="Upload CV or Resume"
                    />
                    {isUploading ? (
                      <div className="upload-loading">
                        <div className="spinner"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : form.resumeFileName ? (
                      <div className="file-info">
                        <div className="file-icon">📄</div>
                        <div className="file-name">{form.resumeFileName}</div>
                        <div className="file-status">✓ Ready - Click to replace</div>
                      </div>
                    ) : (
                      <div className="upload-prompt">
                        <div className="upload-icon">📎</div>
                        <div className="upload-text">Click to Upload CV / Resume</div>
                        <div className="upload-hint">PDF, DOC, DOCX - Max 5MB</div>
                      </div>
                    )}
                  </div>
                </FormField>
              </div>

              {/* Social Links */}
              <FormField 
                label="GitHub Profile" 
                name="github"
                error={errors.github}
              >
                <input
                  type="url"
                  name="github"
                  value={form.github}
                  onChange={(e) => handleFieldChange("github", e.target.value)}
                  placeholder="github.com/username"
                  className={errors.github ? "error" : ""}
                />
              </FormField>

              <FormField 
                label="LinkedIn Profile" 
                name="linkedin"
                error={errors.linkedin}
              >
                <input
                  type="url"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className={errors.linkedin ? "error" : ""}
                />
              </FormField>
            </div>

            {/* Cover Letter */}
            <div className="form-full">
              <FormField 
                label="Cover Letter / Message" 
                name="coverLetter"
                error={null}
              >
                <textarea
                  name="coverLetter"
                  value={form.coverLetter}
                  onChange={(e) => handleFieldChange("coverLetter", e.target.value)}
                  rows={4}
                  placeholder="Tell GJ Global Services why you're the perfect fit for this role..."
                />
              </FormField>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || isUploading}
            >
              {isLoading ? "Submitting..." : "Submit Application →"}
            </button>

            {/* Error Message */}
            {submitError && (
              <div className="error-message" role="alert">
                ⚠️ {submitError}
              </div>
            )}

            {/* Privacy Notice */}
            <p className="privacy-notice">
              By submitting, you agree to GJ Global Services' privacy policy and terms.
            </p>
          </form>
        </div>

        {/* Footer */}
        <footer className="internship-footer">
          © 2025 GJ Global Services PVT. LTD. · All Rights Reserved
        </footer>
      </div>

      <style>{`
        /* Base Styles */
        .internship-apply-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8f0fe 0%, #ffffff 50%, #dbeafe 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .internship-apply-wrapper {
          width: 100%;
          max-width: 720px;
        }

        /* Header */
        .internship-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 16px;
          background: #fff;
          margin-bottom: 1rem;
          box-shadow: 0 8px 32px rgba(21,101,192,0.4);
          overflow: hidden;
        }

        .logo-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .company-name {
          margin: 0 0 0.3rem;
          font-size: 1.6rem;
          font-weight: 700;
          color: #1e3a5f;
        }

        .company-tagline {
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
          color: #1565c0;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .company-motto {
          margin: 0;
          font-size: 0.85rem;
          color: #6b8cae;
        }

        /* Form Card */
        .internship-form-card {
          background: rgba(255,255,255,0.97);
          border: 1px solid #bfdbfe;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 24px 64px rgba(21,101,192,0.12);
        }

        /* Form Header */
        .form-header {
          margin-bottom: 2rem;
        }

        .form-title {
          margin: 0 0 0.4rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e3a5f;
        }

        .form-subtitle {
          margin: 0;
          font-size: 0.82rem;
          color: #6b8cae;
        }

        .university-badge {
          margin-left: 0.5rem;
          background: #e8f0fe;
          color: #1565c0;
          padding: 0.1rem 0.5rem;
          border-radius: 10px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        /* Selected Internship Banner */
        .selected-internship-banner {
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border: 1px solid #90caf9;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .internship-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .internship-icon {
          font-size: 1.5rem;
        }

        .internship-info {
          display: flex;
          flex-direction: column;
        }

        .internship-role {
          font-weight: 700;
          color: #1565c0;
          font-size: 0.95rem;
        }

        .internship-company {
          font-size: 0.8rem;
          color: #1976d2;
        }

        .internship-details {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #1565c0;
        }

        /* Selected Internship Banner */
        .selected-internship-banner {
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 1px solid #a5d6a7;
          border-radius: 10px;
        }

        .internship-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .internship-icon {
          font-size: 1.5rem;
        }

        .internship-info {
          display: flex;
          flex-direction: column;
        }

        .internship-role {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e3a5f;
        }

        .internship-company {
          font-size: 0.8rem;
          color: #2e7d32;
        }

        .internship-details {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #4a7ab5;
          flex-wrap: wrap;
        }

        /* Application Type Toggle */
        .toggle-container {
          margin-bottom: 1.5rem;
        }

        .toggle-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a7ab5;
          display: block;
          margin-bottom: 0.5rem;
        }

        .toggle-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .toggle-button {
          flex: 1;
          padding: 0.65rem;
          background: #f0f6ff;
          border: 1px solid #bfdbfe;
          color: #4a7ab5;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .toggle-button:hover {
          background: #e8f0fe;
        }

        .toggle-button.active {
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          border-color: #1565c0;
          color: #fff;
        }

        /* Info Banner */
        .info-banner {
          margin-bottom: 1.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .info-banner.internship {
          background: #e8f0fe;
          border: 1px solid #90caf9;
          color: #1565c0;
        }

        .info-banner.job {
          background: #e8f5e9;
          border: 1px solid #a5d6a7;
          color: #2e7d32;
        }

        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-full {
          margin-top: 1rem;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        /* Form Field */
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .field-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a7ab5;
          display: block;
        }

        .field-label .required {
          color: #ef5350;
        }

        .field-input,
        .field-select,
        .field-textarea {
          width: 100%;
          padding: 0.65rem 0.85rem;
          background: #f0f6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          color: #1e3a5f;
          font-size: 0.875rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }

        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: #1565c0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
        }

        .field-input.error,
        .field-select.error,
        .field-textarea.error {
          background: rgba(239,83,80,0.04);
          border-color: #ef5350;
        }

        .field-error {
          font-size: 0.7rem;
          color: #ef5350;
        }

        .field-hint {
          font-size: 0.68rem;
          color: #4a7ab5;
          margin-top: 0.2rem;
        }

        /* University Dropdown */
        .university-dropdown {
          position: relative;
        }

        .university-dropdown input {
          padding-right: 2.5rem;
        }

        .dropdown-icon {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          font-size: 0.9rem;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          max-height: 280px;
          overflow-y: auto;
          z-index: 999;
          box-shadow: 0 8px 32px rgba(21,101,192,0.18);
        }

        .dropdown-header {
          padding: 0.4rem 0.9rem;
          font-size: 0.68rem;
          color: #4a7ab5;
          border-bottom: 1px solid #e8f0fe;
          background: #f8fbff;
        }

        .dropdown-item {
          padding: 0.6rem 1rem;
          cursor: pointer;
          border-bottom: 1px solid #e8f0fe;
          transition: background 0.1s;
        }

        .dropdown-item:hover,
        .dropdown-item.selected {
          background: #dbeafe;
        }

        .uni-name {
          font-size: 0.82rem;
          color: #1e3a5f;
          font-weight: 500;
        }

        .uni-country {
          font-size: 0.69rem;
          color: #6b8cae;
          margin-top: 0.1rem;
        }

        .dropdown-empty {
          padding: 1rem;
          text-align: center;
          font-size: 0.82rem;
          color: #6b8cae;
        }

        /* File Upload */
        .file-upload {
          border: 2px dashed #bfdbfe;
          border-radius: 10px;
          background: #f0f6ff;
          padding: 1.4rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .file-upload:hover {
          border-color: #1565c0;
          background: #e8f0fe;
        }

        .file-upload.error {
          border-color: #ef5350;
        }

        .file-upload.has-file {
          border-color: #1565c0;
          background: #e8f0fe;
        }

        .file-upload input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .file-upload input[type="file"]:disabled {
          cursor: not-allowed;
        }

        .upload-prompt,
        .file-info {
          pointer-events: none;
        }

        .upload-icon,
        .file-icon {
          font-size: 1.8rem;
          margin-bottom: 0.3rem;
        }

        .upload-text,
        .file-name {
          font-size: 0.84rem;
          color: #1565c0;
          font-weight: 600;
          word-break: break-all;
        }

        .upload-hint,
        .file-status {
          font-size: 0.7rem;
          color: #6b8cae;
          margin-top: 0.25rem;
        }

        .file-status {
          color: #2e7d32;
        }

        .upload-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #bfdbfe;
          border-top-color: #1565c0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Submit Button */
        .submit-button {
          margin-top: 1.5rem;
          width: 100%;
          padding: 0.95rem;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          border: none;
          color: #fff;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          box-shadow: 0 6px 24px rgba(21,101,192,0.4);
          transition: opacity 0.2s, transform 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          opacity: 0.88;
        }

        .submit-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Error Message */
        .error-message {
          text-align: center;
          margin: 0.75rem 0 0;
          font-size: 0.8rem;
          color: #ef5350;
          background: #ffebee;
          padding: 0.5rem;
          border-radius: 6px;
        }

        /* Privacy Notice */
        .privacy-notice {
          text-align: center;
          margin: 1rem 0 0;
          font-size: 0.75rem;
          color: #6b8cae;
        }

        /* Footer */
        .internship-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: #6b8cae;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .internship-form-card {
            padding: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .toggle-buttons {
            flex-direction: column;
          }

          .university-badge {
            display: block;
            margin-left: 0;
            margin-top: 0.5rem;
          }
        }

        /* Success Screen Styles */
        .success-screen {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8f0fe 0%, #ffffff 50%, #dbeafe 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .success-card {
          background: rgba(255,255,255,0.97);
          border: 1px solid #bfdbfe;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 24px 64px rgba(21,101,192,0.12);
          max-width: 720px;
          width: 100%;
        }

        .success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1b5e20, #2e7d32);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          box-shadow: 0 8px 24px rgba(46,125,50,0.35);
        }

        .success-title {
          font-weight: 700;
          color: #2e7d32;
          margin: 0 0 0.75rem;
          text-align: center;
        }

        .success-message {
          color: #6b8cae;
          margin: 0 0 0.4rem;
          font-size: 0.95rem;
          text-align: center;
        }

        .success-detail {
          color: #6b8cae;
          margin: 0 0 2rem;
          font-size: 0.85rem;
          line-height: 1.7;
          text-align: center;
        }

        .success-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          border: none;
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(21,101,192,0.4);
          transition: all 0.2s;
        }

        .btn-primary:hover {
          opacity: 0.88;
        }

        .btn-secondary {
          padding: 0.75rem 2rem;
          background: transparent;
          border: 1px solid #1565c0;
          color: #1565c0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-secondary:hover,
        .btn-secondary.active {
          background: #e8f0fe;
        }

        .applications-list {
          margin-top: 2rem;
          text-align: left;
        }

        .applications-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e3a5f;
          margin-bottom: 1rem;
        }

        .application-card {
          background: #f8fbff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 0.75rem;
        }

        .application-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .application-position {
          font-weight: 600;
          color: #1565c0;
        }

        .application-status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .application-meta {
          font-size: 0.8rem;
          color: #6b8cae;
        }
      `}</style>
    </div>
  );
}

// Sub-components for better organization

function Header() {
  return (
    <header className="internship-header">
      <div className="logo-container">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kvoD9ahzJ4QSMpoNyOaTmmYfggm18m5sQg&s" 
          alt="GJ Global Services" 
        />
      </div>
      <h1 className="company-name">GJ Global Services</h1>
      <p className="company-tagline">PVT. LTD.</p>
      <p className="company-motto">Building Tomorrow's Solutions Today</p>
    </header>
  );
}

function FormHeader({ applicationType, internship }) {
  return (
    <div className="form-header">
      <h2 className="form-title">Application Form</h2>
      <p className="form-subtitle">
        Fill in your details to apply at GJ Global Services PVT. LTD.
        <span className="university-badge">
          🌍 {UNIVERSITIES.length}+ Universities · {COUNTRIES.length} Countries
        </span>
      </p>
      
      {/* Selected Internship Details */}
      {internship && (
        <div className="selected-internship-banner">
          <div className="internship-badge">
            <span className="internship-icon">{internship.logo || "💼"}</span>
            <div className="internship-info">
              <span className="internship-role">{internship.role}</span>
              <span className="internship-company">{internship.company}</span>
            </div>
          </div>
          <div className="internship-details">
            <span>📍 {internship.location}</span>
            <span>⏳ {internship.duration}</span>
            <span>💰 {internship.stipend}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationTypeToggle({ applicationType, setApplicationType }) {
  return (
    <div className="toggle-container">
      <label className="toggle-label">Apply For *</label>
      <div className="toggle-buttons">
        <button
          type="button"
          className={`toggle-button ${applicationType === "internship" ? "active" : ""}`}
          onClick={() => setApplicationType("internship")}
        >
          🎓 Internship
        </button>
        <button
          type="button"
          className={`toggle-button ${applicationType === "job" ? "active" : ""}`}
          onClick={() => setApplicationType("job")}
        >
          💼 Full-Time Job
        </button>
      </div>
      
      {applicationType === "internship" && (
        <div className="info-banner internship">
          🎓 <strong>Internship</strong> — Duration: 2–6 months · Stipend provided · Certificate on completion
        </div>
      )}
      {applicationType === "job" && (
        <div className="info-banner job">
          💼 <strong>Full-Time Job</strong> — Permanent role · Competitive salary · Growth opportunities
        </div>
      )}
    </div>
  );
}

function FormField({ label, name, error, required, children }) {
  return (
    <div className="form-field">
      <label className="field-label" htmlFor={name}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      {children}
      {error && <span className="field-error" id={`${name}-error`}>{error}</span>}
    </div>
  );
}

function SuccessScreen({ form, applicationType, applications, showApplications, setShowApplications, onReset }) {
  const statusStyle = getStatusBadgeStyle('pending');
  
  return (
    <div className="success-screen">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h2 className="success-title">Application Received!</h2>
        <p className="success-message">
          Thank you, <strong style={{ color: "#1565c0" }}>{form.name}</strong>!
        </p>
        <p className="success-detail">
          Your <strong>{applicationType}</strong> application for <strong style={{ color: "#1565c0" }}>{form.position}</strong><br />
          from <strong style={{ color: "#1565c0" }}>{form.college}</strong>{form.country ? `, ${form.country}` : ""} has been submitted.<br />
          Our team will contact you within 3–5 business days.
        </p>
        
        <div className="success-actions">
          <button onClick={onReset} className="btn-primary">
            Apply Again
          </button>
          
          {applications.length > 0 && (
            <button 
              onClick={() => setShowApplications(!showApplications)} 
              className={`btn-secondary ${showApplications ? "active" : ""}`}
            >
              {showApplications ? "Hide My Applications" : `View My Applications (${applications.length})`}
            </button>
          )}
        </div>

        {showApplications && applications.length > 0 && (
          <div className="applications-list">
            <h3 className="applications-title">My Applications</h3>
            {applications.map((app, index) => {
              const appStatus = getStatusBadgeStyle(app.status);
              return (
                <div key={index} className="application-card">
                  <div className="application-header">
                    <span className="application-position">
                      {app.applicationData?.position || app.role}
                    </span>
                    <span 
                      className="application-status"
                      style={{ background: appStatus.bg, color: appStatus.color }}
                    >
                      {appStatus.label}
                    </span>
                  </div>
                  <div className="application-meta">
                    {app.applicationData?.college || app.company} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusBadgeStyle(status) {
  const styles = {
    pending: { bg: '#fff3e0', color: '#e65100', label: 'Pending' },
    reviewing: { bg: '#e3f2fd', color: '#1565c0', label: 'Reviewing' },
    accepted: { bg: '#e8f5e9', color: '#2e7d32', label: 'Accepted' },
    rejected: { bg: '#ffebee', color: '#c62828', label: 'Rejected' }
  };
  return styles[status] || styles.pending;
}
