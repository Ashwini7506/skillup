'use client';

import { useState } from 'react';
import { sendOTPAction, verifyOTPAction } from '@/app/actions/invitation-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Send, CheckCircle, XCircle } from 'lucide-react';

interface OTPVerificationFormProps {
  email: string;
  onVerifiedAction: () => void;
}

export const OTPVerificationForm = ({ email, onVerifiedAction }: OTPVerificationFormProps) => {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sendOTP = async () => {
    setLoading(true);
    setMessage(null);
    
    const result = await sendOTPAction(email);
    
    if (result.success) {
      setStep('verify');
      setMessage({ type: 'success', text: 'OTP sent to your email' });
    } else {
      setMessage({ type: 'error', text: 'error' in result ? result.error : 'Failed to send OTP' });
    }
    
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    const result = await verifyOTPAction(email, otp);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Email verified successfully' });
      onVerifiedAction();
    } else {
      setMessage({ type: 'error', text: result.error || 'Invalid OTP' });
    }
    
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Email Verification
        </CardTitle>
        <CardDescription>
          {step === 'send' ? 'Verify your email address' : 'Enter the verification code'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'send' ? (
          <>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={email} disabled />
            </div>
            
            <Button onClick={sendOTP} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Verification Code
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('send')}
                disabled={loading}
              >
                Resend Code
              </Button>
              <Button 
                onClick={verifyOTP} 
                disabled={loading || otp.length !== 6}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Code
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
