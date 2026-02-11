import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  style,
  textStyle,
}: ButtonProps) {
  const baseClasses = "rounded-xl flex-row items-center justify-center";
  
  const variantClasses = {
    primary: "bg-emerald-600",
    secondary: "bg-gray-800",
    outline: "bg-transparent border border-gray-300",
  };
  
  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-3",
    lg: "px-8 py-4",
  };
  
  const textColor = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-gray-800",
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#374151' : '#FFFFFF'} />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={`font-semibold ${textColor[variant]} ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
            }`}
            style={textStyle}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}