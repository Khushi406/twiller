'use client';

import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/ExpressAuthContext';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const EditProfile = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    bio: 'Building amazing products with React & Next.js. Love coding, coffee, and creating awesome user experiences. 🚀',
    location: 'San Francisco, CA',
    website: 'johndoe.dev',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1500&h=500&fit=crop',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&size=128&background=1da1f2&color=fff'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    onClose();
    
    // In a real app, you would save to your backend here
    console.log('Profile updated:', formData);
  };

  const handleImageUpload = (type: 'avatar' | 'cover') => {
    // In a real app, you would implement file upload here
    console.log(`Upload ${type} image`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-4">
              <X className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Edit profile</h1>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white text-black hover:bg-gray-200 font-bold px-6"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Cover Image */}
          <div className="relative">
            <div 
              className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative"
              style={{
                backgroundImage: `url(${formData.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleImageUpload('cover')}
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-black overflow-hidden">
                <Image 
                  src={formData.avatar} 
                  alt="Profile picture"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleImageUpload('avatar')}
                    className="text-white"
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-4 mt-16 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                className="bg-transparent border-gray-600 text-white focus:border-blue-500"
                maxLength={50}
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {formData.name.length}/50
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                className="bg-transparent border-gray-600 text-white focus:border-blue-500 min-h-[100px] resize-none"
                maxLength={160}
                placeholder="Tell the world about yourself"
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {formData.bio.length}/160
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                className="bg-transparent border-gray-600 text-white focus:border-blue-500"
                maxLength={30}
                placeholder="Where are you located?"
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {formData.location.length}/30
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Website
              </label>
              <Input
                value={formData.website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('website', e.target.value)}
                className="bg-transparent border-gray-600 text-white focus:border-blue-500"
                maxLength={100}
                placeholder="https://yourwebsite.com"
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {formData.website.length}/100
              </div>
            </div>
          </div>

          {/* Birth date section */}
          <div className="p-4 border-t border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Birth date</h3>
            <p className="text-gray-400 text-sm mb-4">
              This should only be changed if you want to change the associated birth date for your account.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Month
                </label>
                <select className="w-full bg-transparent border border-gray-600 text-white rounded-md p-2 focus:border-blue-500">
                  <option value="">Month</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Day
                </label>
                <Input
                  type="number"
                  placeholder="Day"
                  min="1"
                  max="31"
                  className="bg-transparent border-gray-600 text-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Year
                </label>
                <Input
                  type="number"
                  placeholder="Year"
                  min="1900"
                  max="2024"
                  className="bg-transparent border-gray-600 text-white focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Switch to professional */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Switch to professional</h3>
                <p className="text-gray-400 text-sm">
                  Get access to additional features like analytics and creator tools.
                </p>
              </div>
              <Button variant="outline" className="border-gray-600 text-blue-400 hover:bg-gray-800">
                Switch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;