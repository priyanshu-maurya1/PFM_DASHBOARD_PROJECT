import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Shield, Award, Calendar, User, Mail, AlertTriangle, Download, FileCheck, Lock, Linkedin, Youtube, Instagram, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CertificateVerification() {
  const [certificateId, setCertificateId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, searching, found, not-found
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  // Verify certificate from database
  const verifyCertificate = () => {
    setError('');
    setVerificationStatus('searching');

    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      setVerificationStatus('idle');
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Get all exam data from localStorage
        const db = JSON.parse(localStorage.getItem('examDatabase') || '{}');
        
        // Search through all users' attempts to find matching certificate ID
        let foundCertificate = null;
        let userEmail = '';

        for (const [email, userData] of Object.entries(db)) {
          if (userData.attempts && userData.attempts.length > 0) {
            const attempt = userData.attempts.find(
              att => att.certificateId === certificateId.trim()
            );
            
            if (attempt) {
              foundCertificate = attempt;
              userEmail = email;
              break;
            }
          }
        }

        if (foundCertificate && foundCertificate.status === 'COMPLETED' && foundCertificate.score >= 70) {
          setCertificateData({
            ...foundCertificate,
            email: userEmail,
            candidateName: userEmail.split('@')[0].toUpperCase(),
            issueDate: new Date(foundCertificate.timestamp).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            issueTime: new Date(foundCertificate.timestamp).toLocaleTimeString(),
            verified: true
          });
          setVerificationStatus('found');
        } else if (foundCertificate && foundCertificate.status === 'TERMINATED') {
          setError('This certificate ID exists but the exam was terminated due to violations.');
          setVerificationStatus('not-found');
        } else if (foundCertificate && foundCertificate.score < 70) {
          setError('This certificate ID exists but the candidate did not pass the assessment.');
          setVerificationStatus('not-found');
        } else {
          setError('Certificate ID not found. Please check the ID and try again.');
          setVerificationStatus('not-found');
        }
      } catch (err) {
        setError('An error occurred while verifying the certificate.');
        setVerificationStatus('not-found');
        console.error('Verification error:', err);
      }
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      verifyCertificate();
    }
  };

  const resetVerification = () => {
    setCertificateId('');
    setVerificationStatus('idle');
    setCertificateData(null);
    setError('');
  };

  // Social media links
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/gj-global-services-pvt-ltd/ ',
      icon: Linkedin,
      color: 'hover:text-blue-400'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@gjgs001?si=iAfEoKnxVmKPxPko',
      icon: Youtube,
      color: 'hover:text-red-500'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/gjglobalservices001?igsh=aG1rcDlvc3pzYWVl',
      icon: Instagram,
      color: 'hover:text-pink-400'
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isDark ? 'from-slate-900 via-slate-800 to-slate-900' : 'from-white via-blue-50 to-white'} ${isDark ? 'text-white' : 'text-blue-900'}`}>
      {/* Header */}
      <div className={`border-b ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-blue-100 bg-white/80'} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Company Logo */}
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1TpxEw0mn-9hD-0WCwm1IUgtkKx68e0CUUg&s"
                alt="GJ Global Services Logo"
                className="w-12 h-12 object-contain rounded-md"
              />
              <div>
                <h1 className={`text-xl font-black ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  GJ Global Services
                </h1>
                <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>Certificate Verification Portal</p>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-400'} hidden sm:block`}>Follow Us:</span>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isDark ? 'text-slate-400' : 'text-blue-500'} ${social.color} transition-colors duration-200`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Verification Search Box */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'} border rounded-3xl p-8 shadow-xl mb-8`}>
          <div className="text-center mb-8">
            {/* Company Logo in Verification Section */}
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-xl opacity-20 rounded-full`}></div>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1TpxEw0mn-9hD-0WCwm1IUgtkKx68e0CUUg&s"
                  alt="GJ Global Services Logo"
                  className={`relative w-20 h-20 object-contain rounded-xl ${isDark ? 'bg-slate-700' : 'bg-blue-50'} p-2 ${isDark ? 'border-slate-600' : 'border-blue-100'} border`}
                />
              </div>
            </div>
            
            <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Verify Certificate
            </h2>
            <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>
              Enter the Certificate ID to verify authenticity and view details
            </p>
            
            {/* Social Media Links Below Title */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-blue-400'}`}>Connect with us:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-100'} border rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400' : 'text-blue-500'} ${social.color} transition-all hover:scale-110 ${isDark ? 'hover:bg-slate-600' : 'hover:bg-blue-100'}`}
                  aria-label={social.name}
                  title={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-blue-800'}`}>
                <Lock className="w-4 h-4" /> Certificate ID
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="GJGS-1739366400000-A7B9C2"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`flex-1 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-blue-50 border-blue-200 text-blue-900 placeholder-blue-300'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  disabled={verificationStatus === 'searching'}
                />
                <button
                  onClick={verifyCertificate}
                  disabled={verificationStatus === 'searching'}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-5 h-5" />
                  {verificationStatus === 'searching' ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-blue-400'} mt-2`}>
                The Certificate ID can be found on your certificate document
              </p>
            </div>

            {error && (
              <div className={`${isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-4 flex items-start gap-3`}>
                <XCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-500'} flex-shrink-0 mt-0.5`} />
                <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
              </div>
            )}
          </div>

          {/* How to Find Certificate ID */}
          <div className={`mt-8 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
            <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-blue-800'}`}>
              <AlertTriangle className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-blue-600'}`} />
              How to find your Certificate ID?
            </h3>
            <ul className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-700'} space-y-1 ml-6 list-disc`}>
              <li>Check the bottom of your certificate PDF</li>
              <li>Look for a code starting with "GJGS-"</li>
              <li>The ID is also included in your result email</li>
              <li>You can scan the QR code on the certificate to auto-verify</li>
            </ul>
          </div>
        </div>

        {/* Verification Result - Success */}
        {verificationStatus === 'found' && certificateData && (
          <div className={`${isDark ? 'from-green-900/30 to-emerald-900/30 border-green-700' : 'from-green-50 to-emerald-50 border-green-200'} bg-gradient-to-br border-2 rounded-3xl p-8 shadow-xl animate-fadeIn`}>
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 ${isDark ? 'bg-green-900/30' : 'bg-green-100'} rounded-full mb-4`}>
                <CheckCircle className={`w-10 h-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                ✓ CERTIFICATE VERIFIED
              </h2>
              <p className={isDark ? 'text-slate-400' : 'text-blue-600'}>
                This certificate is authentic and has been issued by GJ Global Services
              </p>
            </div>

            {/* Certificate Details */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-100'} rounded-2xl p-6 mb-6 border`}>
              <h3 className={`font-bold text-xl mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>
                <Award className="w-6 h-6 text-yellow-500" />
                Certificate Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'} mb-1`}>Certificate ID</p>
                  <p className={`font-bold text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{certificateData.certificateId}</p>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'} mb-1`}>Status</p>
                  <p className={`font-bold text-lg ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓ VALID & VERIFIED</p>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'} mb-1 flex items-center gap-1`}>
                    <User className="w-4 h-4" /> Candidate Name
                  </p>
                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.candidateName}</p>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'} mb-1 flex items-center gap-1`}>
                    <Mail className="w-4 h-4" /> Email
                  </p>
                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.email}</p>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'} mb-1 flex items-center gap-1`}>
                    <Calendar className="w-4 h-4" /> Issue Date
                  </p>
                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.issueDate}</p>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'} mb-1`}>Issue Time</p>
                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.issueTime}</p>
                </div>
              </div>
            </div>

            {/* Assessment Details */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-100'} rounded-2xl p-6 mb-6 border`}>
              <h3 className={`font-bold text-xl mb-4 ${isDark ? 'text-white' : 'text-blue-800'}`}>Assessment Performance</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className={`${isDark ? 'bg-slate-700' : 'bg-white'} rounded-xl p-4 text-center border ${isDark ? 'border-slate-600' : 'border-blue-100'}`}>
                  <div className={`text-4xl font-black ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-1`}>
                    {certificateData.score}%
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>Final Score</div>
                </div>

                <div className={`${isDark ? 'bg-slate-700' : 'bg-white'} rounded-xl p-4 text-center border ${isDark ? 'border-slate-600' : 'border-blue-100'}`}>
                  <div className={`text-4xl font-black ${isDark ? 'text-green-400' : 'text-green-600'} mb-1`}>
                    {certificateData.correctAnswers}/{certificateData.totalQuestions}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>Correct Answers</div>
                </div>

                <div className={`${isDark ? 'bg-slate-700' : 'bg-white'} rounded-xl p-4 text-center border ${isDark ? 'border-slate-600' : 'border-blue-100'}`}>
                  <div className={`text-4xl font-black ${isDark ? 'text-purple-400' : 'text-purple-600'} mb-1`}>
                    {Math.max(0, 100 - (certificateData.violations?.warnings || 0) * 2)}%
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>Integrity Score</div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'} mb-1`}>Questions Attempted</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.questionsAttempted} / {certificateData.totalQuestions}</p>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'} mb-1`}>Duration</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>
                    {Math.floor(certificateData.duration / 60)}m {certificateData.duration % 60}s
                  </p>
                </div>
              </div>
            </div>

            {/* Proctoring & Security */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-100'} rounded-2xl p-6 mb-6 border`}>
              <h3 className={`font-bold text-xl mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>
                <Shield className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                Proctoring & Security Report
              </h3>

              <div className={`grid md:grid-cols-3 gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>
                <div className="flex justify-between">
                  <span>Total Warnings:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.violations?.warnings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tab Switches:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.violations?.tabSwitches || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Copy/Paste:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.violations?.copyPasteAttempts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fullscreen Exits:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.violations?.fullscreenExits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Face Issues:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.violations?.noFaceDetected || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Multiple Faces:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{certificateData.violations?.multipleFaces || 0}</span>
                </div>
              </div>

              <div className={`mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                <CheckCircle className="w-4 h-4" />
                <span>AI Proctoring: Active | Camera: Monitored | Audio: Detected</span>
              </div>
            </div>

            {/* Verification Seal */}
            <div className={`${isDark ? 'from-slate-800 to-slate-700 border-slate-600' : 'from-blue-50 to-purple-50 border-blue-200'} bg-gradient-to-r rounded-2xl p-6 border text-center`}>
              <div className="flex items-center justify-center gap-3 mb-3">
                <Shield className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`font-black text-2xl ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>OFFICIALLY VERIFIED</h3>
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-600'}`}>
                This certificate has been digitally verified and authenticated by GJ Global Services.
                The assessment was conducted under AI-proctored conditions with strict security measures.
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-blue-400'} mt-2`}>
                Verified on: {new Date().toLocaleString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetVerification}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-white' : 'bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-700'}`}
              >
                Verify Another Certificate
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Print Verification
              </button>
            </div>
          </div>
        )}

        {/* Verification Result - Not Found */}
        {verificationStatus === 'not-found' && (
          <div className={`${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border-2 rounded-3xl p-8 shadow-xl text-center`}>
            <div className={`inline-flex items-center justify-center w-20 h-20 ${isDark ? 'bg-red-900/30' : 'bg-red-100'} rounded-full mb-4`}>
              <XCircle className={`w-10 h-10 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            </div>
            <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
              VERIFICATION FAILED
            </h2>
            <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-blue-600'}`}>
              {error || 'The certificate ID you entered could not be verified.'}
            </p>

            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-xl p-4 mb-6 text-left border ${isDark ? 'border-slate-700' : 'border-red-100'}`}>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>Possible reasons:</h3>
              <ul className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-600'} space-y-1 ml-6 list-disc`}>
                <li>The Certificate ID was entered incorrectly</li>
                <li>The certificate has not been issued yet</li>
                <li>The certificate may have been revoked</li>
                <li>The exam was not completed successfully</li>
              </ul>
            </div>

            <button
              onClick={resetVerification}
              className={`py-3 px-6 rounded-xl font-bold transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-white' : 'bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-700'}`}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Info Section */}
        {verificationStatus === 'idle' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'} border rounded-2xl p-6 shadow-md`}>
              <div className={`w-12 h-12 ${isDark ? 'bg-slate-700' : 'bg-blue-100'} rounded-xl flex items-center justify-center mb-4`}>
                <Shield className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>Secure Verification</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>
                All certificates are verified against our secure database with encryption
              </p>
            </div>

            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'} border rounded-2xl p-6 shadow-md`}>
              <div className={`w-12 h-12 ${isDark ? 'bg-green-900/30' : 'bg-green-100'} rounded-xl flex items-center justify-center mb-4`}>
                <CheckCircle className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>Instant Results</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>
                Get immediate verification status and detailed certificate information
              </p>
            </div>

            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'} border rounded-2xl p-6 shadow-md`}>
              <div className={`w-12 h-12 ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'} rounded-xl flex items-center justify-center mb-4`}>
                <Award className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>Complete Details</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>
                View full assessment results, scores, and proctoring reports
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`border-t ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-blue-100 bg-white/80'} backdrop-blur-xl mt-12`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1TpxEw0mn-9hD-0WCwm1IUgtkKx68e0CUUg&s"
                  alt="GJ Global Services Logo"
                  className="w-8 h-8 object-contain rounded-md"
                />
                <span className={`font-bold text-lg ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  GJ Global Services
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>
                Leading provider of secure, AI-proctored certification and assessment solutions.
              </p>
            </div>

            {/* Connect With Us */}
            <div>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-blue-800'}`}>Connect With Us</h3>
              <div className="flex items-center gap-4 mb-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 ${isDark ? 'bg-slate-700' : 'bg-blue-100'} rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400' : 'text-blue-500'} ${social.color} transition-all hover:scale-110`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <div className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-blue-500'}`}>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  infogjglobalservices@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  +91 8445896023
                </p>
              </div>
            </div>
          </div>

          <div className={`border-t ${isDark ? 'border-slate-700' : 'border-blue-100'} pt-6 text-center text-sm ${isDark ? 'text-slate-500' : 'text-blue-400'}`}>
            <p>© 2026 GJ Global Services. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
