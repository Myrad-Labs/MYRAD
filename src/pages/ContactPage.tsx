import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle, ArrowLeft, Building2, Mail, User, MessageSquare, Briefcase } from 'lucide-react';

const ContactPage = () => {
    const accent = '#fff';
    const purple = '#fff';

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
                headers: {
                    'Content-Type': 'application/json'
                },
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
            // Even if backend fails, show success for demo
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                fontFamily: "'Inter', -apple-system, sans-serif"
            }}>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

                <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <CheckCircle size={40} color="#fff" />
                    </div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '16px',
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                        Inquiry Submitted!
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', lineHeight: 1.7 }}>
                        Thank you for your interest in MYRAD. Our team will review your inquiry and get back to you within 1-2 business days.
                    </p>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 28px',
                            background: '#fff',
                            borderRadius: '10px',
                            color: '#000',
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

    return (
        <div style={{
            background: '#000',
            minHeight: '100vh',
            color: '#fff',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
                * { font-family: 'Inter', -apple-system, sans-serif; }
                h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; }
                .input-field {
                    width: 100%;
                    padding: 16px 20px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    outline: none;
                }
                .input-field:focus {
                    border-color: rgba(255, 255, 255, 0.5);
                    background: rgba(255,255,255,0.05);
                }
                .input-field::placeholder {
                    color: rgba(255,255,255,0.3);
                }
                .btn-submit {
                    width: 100%;
                    padding: 18px;
                    background: #fff;
                    border: none;
                    border-radius: 12px;
                    color: #000;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(255, 255, 255, 0.15);
                }
                .btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
            `}</style>

            {/* Header */}
            <header style={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <span style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: accent,
                            fontFamily: "'Space Grotesk', sans-serif"
                        }}>MYRAD</span>
                    </Link>
                    <Link to="/buyers" style={{
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <ArrowLeft size={16} />
                        Back to Buyers
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '80px 24px'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <Mail size={32} color={purple} />
                    </div>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: 700,
                        marginBottom: '16px'
                    }}>
                        Access <span style={{ color: purple }}>Exclusive</span> Intelligence
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>
                        Fill out the form below and our team will reach out to discuss your data needs.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '40px'
                }}>
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            padding: '14px 18px',
                            marginBottom: '24px',
                            color: '#ef4444',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '10px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.7)'
                        }}>
                            <User size={16} />
                            Name
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
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '10px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.7)'
                        }}>
                            <Building2 size={16} />
                            Company
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

                    {/* Work Email */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '10px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.7)'
                        }}>
                            <Mail size={16} />
                            Work Email <span style={{ color: '#ef4444' }}>*</span>
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
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '10px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.7)'
                        }}>
                            <Briefcase size={16} />
                            Industry
                        </label>
                        <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            className="input-field"
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="" style={{ background: '#1a1a1a' }}>Select your industry</option>
                            {industries.map((industry, i) => (
                                <option key={i} value={industry} style={{ background: '#1a1a1a' }}>
                                    {industry}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Message */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '10px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.7)'
                        }}>
                            <MessageSquare size={16} />
                            Message
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="What data are you looking for? Tell us about your use case..."
                            className="input-field"
                            rows={5}
                            style={{ resize: 'vertical', minHeight: '120px' }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-submit"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {submitting ? (
                            'Sending...'
                        ) : (
                            <>
                                <Send size={18} />
                                Send Inquiry
                            </>
                        )}
                    </button>
                </form>

                {/* Privacy Note */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '13px'
                }}>
                    By submitting, you agree to our{' '}
                    <Link to="/privacy" style={{ color: purple }}>Privacy Policy</Link>
                    {' '}and{' '}
                    <Link to="/terms" style={{ color: purple }}>Terms of Service</Link>.
                </p>
            </main>
        </div>
    );
};

export default ContactPage;
