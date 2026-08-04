import React, { useState } from 'react';
import { Building2, Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import { CITIES } from '../../data/mockData';
import { WholesaleRegistrationData } from '../../types';

interface RegisterScreenProps {
  onSubmitRegistration: (data: WholesaleRegistrationData) => void;
  onGoHome: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onSubmitRegistration,
  onGoHome
}) => {
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Wah Cantt');
  const [businessType, setBusinessType] = useState('Registered Business');
  const [email, setEmail] = useState('');
  const [hasDocument, setHasDocument] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isDocRequired = businessType === 'Registered Business';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRegistration({
      businessName,
      contactPerson,
      phone,
      address,
      city,
      businessType,
      email: isDocRequired ? email : undefined,
      hasDocument
    });
    setIsSubmitted(true);
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-4">
      {isSubmitted ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 text-center space-y-4 shadow-md">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-300 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-[#051f20]">
              Wholesale Registration Submitted!
            </h2>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Standard catalog prices apply until verification completes. You will receive an alert once your wholesale tier is approved by our team.
            </p>
          </div>

          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-3 bg-[#163832] text-white rounded-full font-semibold text-xs shadow-md hover:bg-[#0b2924]"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <>
          <div>
            <h1 className="font-display font-bold text-lg text-[#051f20]">
              Wholesale Shop Registration
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Register your retail shop or institution for bulk per-unit discount pricing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3.5 shadow-xs">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Business / Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Raza Traders"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmed Raza"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Shop Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Shop #, Street / Market, Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  City *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Business Type *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
                >
                  <option value="Retail Shop (unregistered)">Retail Shop (Unregistered)</option>
                  <option value="Registered Business">Registered Business (Requires NTN / CNIC)</option>
                  <option value="School / Institution">School / Educational Institution</option>
                </select>
              </div>

              {/* Conditional NTN/CNIC Document Upload for Registered Business */}
              {isDocRequired && (
                <div className="bg-[#f2f7f5] p-3 rounded-2xl border border-[#a3c5a8]/60 space-y-2">
                  <div className="font-semibold text-[#163832] flex items-center gap-1.5">
                    <Building2 size={14} />
                    <span>NTN & Verification Documents</span>
                  </div>

                  <div>
                    <label className="block text-stone-600 text-[11px] font-medium mb-1">
                      Business Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="business@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#163832]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setHasDocument(!hasDocument)}
                    className={`w-full py-2.5 rounded-xl border-1.5 border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      hasDocument
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                        : 'bg-white text-[#163832] border-[#a3c5a8] hover:bg-[#f2f7f5]'
                    }`}
                  >
                    <Upload size={14} />
                    <span>
                      {hasDocument
                        ? 'NTN / CNIC Document Uploaded ✓'
                        : '+ Upload NTN / CNIC Document'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#163832] hover:bg-[#0b2924] text-white rounded-full font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span>Submit Wholesale Registration</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
