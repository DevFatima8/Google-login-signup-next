"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "../../components/ProfileCard";
import LocationTracker from "../../components/LocationTracker";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedLocation, setSavedLocation] = useState(null);
  const router = useRouter();
  
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/current-user");
      const data = await res.json();
      if (!data.user) {
        router.push("/");
      }
      setUser(data.user);
      if (data.user?.location) {
        setSavedLocation(data.user.location);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  const fetchLocationHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/location");
      const data = await res.json();
      if (data.location) {
        setSavedLocation(data.location);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  }, []);
  
  useEffect(() => {
    fetchUser();
    fetchLocationHistory();
  }, [fetchUser, fetchLocationHistory]);
  
  const handleLocationCaptured = (location) => {
    setSavedLocation(location);
    // Refresh user data
    fetchUser();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          My Profile
        </h1>
        
        <ProfileCard user={user} />
        
        {/* Location Tracker Component */}
        <LocationTracker onLocationCaptured={handleLocationCaptured} />
        
        {/* Saved Location Info */}
        {savedLocation && savedLocation.lat && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-green-800 mb-2">Saved Location</h4>
            <p className="text-sm text-green-700">
              <strong>Coordinates:</strong> {savedLocation.lat}, {savedLocation.lng}
            </p>
            {savedLocation.address && (
              <p className="text-sm text-green-700 mt-1">
                <strong>Address:</strong> {savedLocation.address}
              </p>
            )}
            <p className="text-xs text-green-600 mt-2">
              Saved on: {new Date(savedLocation.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}