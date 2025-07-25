import { useState } from "react";
import { CreditCard, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (paymentData: PaymentData) => void;
  amount: number;
  serviceFee: number;
  jobId: string;
  isLoading?: boolean;
}

export interface PaymentData {
  amount: number;
  phoneNumber: string;
  jobId: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onPayment,
  amount,
  serviceFee,
  jobId,
  isLoading = false
}: PaymentModalProps) {
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const total = amount + serviceFee;

  const validatePhoneNumber = (phone: string): boolean => {
    // Kenyan phone number validation
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Convert to international format
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('+254')) {
      return cleaned;
    }
    
    return '+254' + cleaned;
  };

  const handlePayment = () => {
    setError("");

    if (!phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number");
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    onPayment({
      amount: total,
      phoneNumber: formattedPhone,
      jobId
    });
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (error) setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t('securePayment')}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('serviceCost')}</span>
                <span className="font-semibold">KES {amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('appFee')} ({((serviceFee / amount) * 100).toFixed(1)}%)</span>
                <span className="font-semibold">KES {serviceFee.toFixed(2)}</span>
              </div>
              <hr className="my-3" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>{t('total')}</span>
                <span className="text-kenyan-red">KES {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              M-Pesa Phone Number *
            </label>
            <Input
              type="tel"
              placeholder="0700 123 456 or +254700123456"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              You will receive an M-Pesa prompt on this number
            </p>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isLoading || !phoneNumber.trim()}
            className="w-full bg-kenyan-green hover:bg-green-700 text-white font-semibold py-4 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>{t('payWithMpesa')}</span>
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>{t('paymentSecure')}</span>
          </div>

          {/* Payment Instructions */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2">Payment Instructions:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p>1. You will receive an M-Pesa prompt on your phone</p>
                <p>2. Enter your M-Pesa PIN to authorize payment</p>
                <p>3. Payment will be released to the provider after job completion</p>
                <p>4. You can rate and review the service provider</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
