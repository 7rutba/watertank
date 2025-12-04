import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../utils/api';

const ContactSupport = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const payload = {
        subject: formData.subject,
        description: formData.message,
        category: formData.category,
        priority: 'medium',
        // Include vendorId if user is logged in as vendor
        ...(user.vendorId && { vendorId: user.vendorId }),
      };

      // If logged in, use support ticket API
      if (token) {
        await api.post('/admin/support/tickets', payload);
      } else {
        // For non-logged in users, you might want to create a public contact endpoint
        // For now, we'll just show success message
        console.log('Contact form submission:', formData);
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general',
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError(error.response?.data?.message || 'Failed to submit your message. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const supportPhone = '7061274672';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Contact Support
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            We're here to help! Get in touch with our support team
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Contact Information Card */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Get in Touch</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Reach out to us through any of these channels. We typically respond within 24 hours.
                  </p>
                </div>

                {/* Phone Number */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">Phone Support</h3>
                    <a 
                      href={`tel:${supportPhone}`}
                      className="text-primary hover:text-primary-hover font-medium text-lg block"
                    >
                      +91 {supportPhone}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✉️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">Email Support</h3>
                    <a 
                      href="mailto:support@watertank.com"
                      className="text-primary hover:text-primary-hover font-medium block break-all"
                    >
                      support@watertank.com
                    </a>
                    <p className="text-xs text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">WhatsApp</h3>
                    <a 
                      href={`https://wa.me/91${supportPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-medium block"
                    >
                      Chat on WhatsApp
                    </a>
                    <p className="text-xs text-gray-500 mt-1">Quick response via WhatsApp</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <a
                      href={`tel:${supportPhone}`}
                      className="block w-full"
                    >
                      <Button variant="primary" className="w-full">
                        📞 Call Now
                      </Button>
                    </a>
                    <a
                      href={`https://wa.me/91${supportPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                        💬 WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for contacting us. We'll get back to you as soon as possible.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        maxLength="10"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Support</option>
                          <option value="billing">Billing & Payments</option>
                          <option value="account">Account Issues</option>
                          <option value="feature_request">Feature Request</option>
                          <option value="bug">Report a Bug</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <Input
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your issue"
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        placeholder="Please describe your issue or question in detail..."
                        required
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                      <a
                        href={`tel:${supportPhone}`}
                        className="flex-1"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                        >
                          📞 Call Instead
                        </Button>
                      </a>
                    </div>
                  </form>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 sm:mt-12">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">⏰</div>
                <h3 className="font-semibold text-gray-800 mb-1">Response Time</h3>
                <p className="text-sm text-gray-600">Within 24 hours</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🌍</div>
                <h3 className="font-semibold text-gray-800 mb-1">Support Hours</h3>
                <p className="text-sm text-gray-600">24/7 Available</p>
              </div>
              <div>
                <div className="text-3xl mb-2">💬</div>
                <h3 className="font-semibold text-gray-800 mb-1">Multiple Channels</h3>
                <p className="text-sm text-gray-600">Phone, Email, WhatsApp</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;

