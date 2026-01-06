import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  CheckCircle,
  ArrowLeft,
  Building2,
  Mail,
  User,
  MessageSquare,
  Briefcase
} from 'lucide-react';



import Header from '../components/Header';
import Footer from '../components/Footer';
import Waves from '../components/DynamicBackground';


const ContactPage = () => {
  const purple = '#374151';

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);


  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    industry: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const industries = [
    'Advertising & Marketing',
    'Financial Services',
    'E-commerce & Retail',
    'Healthcare',
    'Technology',
    'Research & Analytics',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.company) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  /* ===================== SUCCESS PAGE ===================== */
  if (submitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "inherit",
          color: '#374151',
          position: 'relative'


        }}
      >


        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <CheckCircle size={40} color="#000" />
          </div>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '16px',

            }}
          >
            Inquiry Submitted!
          </h1>

          <p
            style={{
              color: 'rgba(0,0,0,0.6)',
              marginBottom: '32px',
              lineHeight: 1.7
            }}
          >
            Thank you for your interest in MYRAD. Our team will review your inquiry
            and get back to you within 1–2 business days.
          </p>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              background: '#374151',
              borderRadius: '10px',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px'
            }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  /* ===================== MAIN PAGE ===================== */
  return (
    <div
      style={{
        background: '#fff',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden'
      }}>
      {/* Dynamic Waves Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <Waves
          lineColor="rgba(0,0,0,0.04)"
          backgroundColor="#ffffff"
          waveSpeedX={0.01}
          waveSpeedY={0.005}
          waveAmpX={30}
          waveAmpY={15}
          friction={0.95}
          tension={0.01}
          maxCursorMove={100}
          xGap={10}
          yGap={30}
        />
      </div>

      <style>{`
        * { font-family: 'Inter', -apple-system, sans-serif; }
        h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; }

        .input-field {
          width: 100%;
          padding: 16px 20px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 12px;
          color: #000;
          font-size: 15px;
          transition: all 0.3s ease;
          outline: none;
        }

        .input-field:focus {
          border-color: #000;
        }

        .input-field::placeholder {
          color: rgba(0,0,0,0.4);
        }

        .btn-submit {
          width: 100%;
          padding: 18px;
          background: #374151;
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }

      `}</style>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        {/* Main */}
        <main
          className={isVisible ? 'animate-fadeInUp delay-100' : ''}
          style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px' }}
        >
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}
            >
              <Mail size={32} color={purple} />
            </div>

            <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
              Access <span style={{ color: purple }}>Exclusive</span> Intelligence
            </h1>

            <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '16px' }}>
              Fill out the form below and our team will reach out to discuss your data needs.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '24px',
              padding: '40px'
            }}
          >
            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  marginBottom: '24px',
                  color: '#ef4444',
                  fontSize: '14px'
                }}
              >
                {error}
              </div>
            )}

            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: 500 }}>
                <User size={16} /> Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="input-field"
                required
              />
            </div>

            {/* Company */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: 500 }}>
                <Building2 size={16} /> Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company name"
                className="input-field"
                required
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: 500 }}>
                <Mail size={16} /> Work Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="input-field"
                required
              />
            </div>

            {/* Industry */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: 500 }}>
                <Briefcase size={16} /> Industry
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select your industry</option>
                {industries.map((industry, i) => (
                  <option key={i} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: 500 }}>
                <MessageSquare size={16} /> Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="What data are you looking for?"
                className="input-field"
                rows={5}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-submit">
              {submitting ? 'Sending...' : (
                <>
                  <Send size={18} /> Send Inquiry
                </>
              )}
            </button>
          </form>

        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ContactPage;
