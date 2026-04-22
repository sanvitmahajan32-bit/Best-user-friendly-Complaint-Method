import React, { useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  Camera, MapPin, Send, Trash2, Loader2, 
  Trash, Truck, Flame, Wind, Droplets, 
  Lightbulb, Waves, Construction, Skull, 
  AlertTriangle, Bath, PlusCircle
} from 'lucide-react';
import { cn } from '../utils';
import { handleFirestoreError, OperationType } from '../firestore-errors';
import { motion } from 'motion/react';

const CATEGORIES = [
  { id: "Cleanliness Target Unit (Dirty Spot)", icon: AlertTriangle, label: "Dirty Spot" },
  { id: "Garbage Dump", icon: Trash, label: "Garbage Dump" },
  { id: "Garbage Vehicle Not Arrived", icon: Truck, label: "Vehicle Not Arrived" },
  { id: "Burning of Garbage in Open Space", icon: Flame, label: "Garbage Burning" },
  { id: "Sweeping Not Done", icon: Wind, label: "Sweeping Not Done" },
  { id: "Dustbins Not Cleaned", icon: Trash2, label: "Dustbins Not Cleaned" },
  { id: "Open Defecation", icon: AlertTriangle, label: "Open Defecation" },
  { id: "Overflow of Sewerage or Storm Water", icon: Waves, label: "Sewerage Overflow" },
  { id: "Stagnant Water on Road / Open Area", icon: Droplets, label: "Stagnant Water" },
  { id: "Overflow of Septic Tanks", icon: Waves, label: "Septic Tank Overflow" },
  { id: "No Electricity in Public Toilet", icon: Lightbulb, label: "Toilet No Power" },
  { id: "No Water Supply in Public Toilet", icon: Droplets, label: "Toilet No Water" },
  { id: "Blockage in Public Toilet", icon: AlertTriangle, label: "Toilet Blockage" },
  { id: "Unclean Public Toilet", icon: Bath, label: "Unclean Toilet" },
  { id: "Improper Disposal of Fecal Waste / Septage", icon: AlertTriangle, label: "Fecal Waste Disposal" },
  { id: "Removal of Debris / Construction Material", icon: Construction, label: "Debris Removal" },
  { id: "Removal of Dead Animals", icon: Skull, label: "Dead Animal Removal" }
];

interface ComplaintFormProps {
  onSuccess: () => void;
}

export default function ComplaintForm({ onSuccess }: ComplaintFormProps) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('Image size must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const detectLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setDetectingLocation(false);
        toast.success('Location detected!');
      },
      (error) => {
        console.error('Location error:', error);
        toast.error('Failed to detect location');
        setDetectingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return toast.error('Please select a category');
    if (!description) return toast.error('Please provide a description');
    if (!location) return toast.error('Please detect your location');

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      await addDoc(collection(db, 'complaints'), {
        userId: user.uid,
        userEmail: user.email,
        category,
        description,
        imageUrl: image,
        location,
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Complaint submitted successfully!');
      onSuccess();
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, 'complaints');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-display font-bold text-stone-900 flex items-center justify-center gap-3">
          <PlusCircle className="w-8 h-8 text-orange-600" />
          Post a Complaint
        </h2>
        <p className="text-stone-500 max-w-lg mx-auto">Select a category and provide details to help us serve you better.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Category Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold">1</span>
            <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">
              Select Category
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group text-center space-y-3",
                  category === cat.id
                    ? "border-orange-500 bg-orange-50 text-orange-700 shadow-lg scale-105 ring-4 ring-orange-100"
                    : "border-stone-100 bg-white hover:border-orange-200 hover:bg-stone-50 text-stone-600"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl transition-colors",
                  category === cat.id ? "bg-orange-100" : "bg-stone-50 group-hover:bg-orange-50"
                )}>
                  <cat.icon className={cn(
                    "w-6 h-6 transition-transform group-hover:scale-110",
                    category === cat.id ? "text-orange-600" : "text-stone-400 group-hover:text-orange-400"
                  )} />
                </div>
                <span className="text-[11px] font-bold leading-tight uppercase tracking-tighter">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold">2</span>
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">
                  Provide Details
                </label>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full h-48 p-5 rounded-3xl border-2 border-stone-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-50/50 transition-all resize-none bg-white shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold">3</span>
                <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">
                  Location
                </label>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                className={cn(
                  "w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all shadow-sm",
                  location 
                    ? "border-green-500 bg-green-50 text-green-700" 
                    : "border-stone-100 bg-white hover:border-orange-200 text-stone-600"
                )}
              >
                {detectingLocation ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
                <span className="font-bold">
                  {location ? `Location Captured (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})` : 'Detect My Location'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold">4</span>
              <label className="text-sm font-bold text-stone-700 uppercase tracking-widest">
                Upload Evidence
              </label>
            </div>
            <div className="relative group">
              {image ? (
                <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-stone-100 shadow-inner">
                  <img src={image} alt="Complaint" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="p-4 bg-white text-red-600 rounded-full hover:bg-red-50 transition-all shadow-2xl scale-90 group-hover:scale-100"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed border-stone-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer group shadow-sm">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-6 bg-stone-50 rounded-full group-hover:bg-orange-100 transition-colors">
                      <Camera className="w-10 h-10 text-stone-400 group-hover:text-orange-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-stone-600">Click or Drag to upload photo</p>
                      <p className="text-sm text-stone-400 mt-1">Max size: 1MB</p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 p-4 bg-orange-600 text-white rounded-2xl font-bold text-base hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98] uppercase tracking-widest"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Complaint
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
