
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  phone: string;
  setPhone: (value: string) => void;
  isAutoFilled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ phone, setPhone, isAutoFilled = false }) => {
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) {
      setPhone(value.slice(0, 9));
    } else {
      setPhone(value);
    }
  };

  return (
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id="phone"
        type="text"
        value={phone}
        onChange={handlePhoneInput}
        placeholder="9XXXXXXXX"
        pattern="9[0-9]{8}"
        maxLength={9}
        className={`pl-10 ${isAutoFilled ? 'bg-gray-100 cursor-not-allowed border-dashed border-microsoft-blue/40' : ''}`}
        required
        readOnly={isAutoFilled}
      />
    </div>
  );
};
