// src/components/PhoneInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Phone, ChevronDown } from 'lucide-react-native';

const countryCodes = [
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+243', name: 'Congo (DRC)', flag: '🇨🇩' },
];

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Enter phone number',
  editable = true,
  error,
}) => {
  const [showCountryCodes, setShowCountryCodes] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Sync display value with parent value
  useEffect(() => {
    // Format the value for display
    const formattedValue = formatForDisplay(value || '');
    setDisplayValue(formattedValue);
  }, [value]);

  // Format digits for display
  const formatForDisplay = (digits: string): string => {
    const cleaned = digits.replace(/\D/g, '');
    
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Parse display to digits
  const parseToDigits = (formatted: string): string => {
    return formatted.replace(/\D/g, '');
  };

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setShowCountryCodes(false);
  };

  const handleTextChange = (text: string) => {
    // Update display value
    setDisplayValue(text);
    
    // Parse to digits and send to parent
    const digits = parseToDigits(text);
    onChangeText(digits);
  };

  // Handle focus to position cursor correctly
  const handleFocus = () => {
    if (displayValue === '' && inputRef.current) {
      // Keep cursor at start when empty
      inputRef.current.setNativeProps({
        selection: { start: 0, end: 0 }
      });
    }
  };

  return (
    <View>
      <Text className="text-gray-700 font-medium mb-2">Phone Number</Text>
      
      <View className={`flex-row items-center bg-gray-50 rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} overflow-hidden`}>
        {/* Country Code Selector */}
        <TouchableOpacity
          onPress={() => setShowCountryCodes(true)}
          disabled={!editable}
          className="flex-row items-center pl-4 pr-3 border-r border-gray-300 h-14"
        >
          <Text className="text-lg mr-1">{selectedCountry.flag}</Text>
          <Text className="text-gray-700 font-medium">{selectedCountry.code}</Text>
          <ChevronDown size={16} color="#6B7280" className="ml-1" />
        </TouchableOpacity>
        
        {/* Phone Input */}
        <View className="flex-1 flex-row items-center h-14">
          <View className="pl-3 pr-2">
            <Phone size={20} color="#6B7280" />
          </View>
          <TextInput
            ref={inputRef}
            value={displayValue}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            keyboardType="phone-pad"
            editable={editable}
            className="flex-1 h-full text-gray-800 text-base"
            maxLength={14} // For formatted number: (255) 712-3456
            selectionColor="#10B981"
          />
        </View>
      </View>
      
      {error ? (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      ) : (
        <Text className="text-gray-500 text-xs mt-1">
          Used for order updates and notifications
        </Text>
      )}
      
      {/* Country Code Modal */}
      <Modal
        visible={showCountryCodes}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryCodes(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-4 w-80 max-h-96">
            <Text className="text-lg font-bold mb-4 text-center">Select Country</Text>
            <FlatList
              data={countryCodes}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCountrySelect(item)}
                  className="flex-row items-center p-3 border-b border-gray-100"
                >
                  <Text className="text-2xl mr-3">{item.flag}</Text>
                  <Text className="text-gray-800 font-medium">{item.name}</Text>
                  <Text className="text-gray-600 ml-auto">{item.code}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowCountryCodes(false)}
              className="mt-4 py-3 bg-gray-100 rounded-xl"
            >
              <Text className="text-center text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PhoneInput;