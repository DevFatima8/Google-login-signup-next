"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocation, setShowLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationError, setLocationError] = useState(null);
  const router = useRouter();
  
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/current-user");
      const data = await res.json();
      if (!data.user) {
        router.push("/");
      }
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      return {
        address: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village,
        country: data.address?.country,
      };
    } catch (error) {
      console.error("Error getting address:", error);
      return { address: null, city: null, country: null };
    }
  };
  
  const saveLocationToServer = async (locationData) => {
    try {
      const response = await fetch("/api/auth/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });
      
      const data = await response.json();
      if (data.success) {
        console.log("Location saved to server");
        return data;
      }
    } catch (error) {
      console.error("Error saving location to server:", error);
    }
  };
  
  const getCurrentLocation = () => {
    setLocationStatus("loading");
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get address from coordinates
        const addressInfo = await getAddressFromCoords(latitude, longitude);
        
        const locationData = {
          lat: latitude,
          lng: longitude,
          address: addressInfo.address,
          city: addressInfo.city,
          country: addressInfo.country,
        };
        
        setLocation(locationData);
        setLocationStatus("success");
        
        // Save to server
        await saveLocationToServer(locationData);
      },
      (error) => {
        setLocationStatus("error");
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("The request to get user location timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };
  
  const fetchSavedLocation = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/location");
      const data = await res.json();
      if (data.location && data.location.lat) {
        setLocation(data.location);
      }
    } catch (error) {
      console.error("Error fetching saved location:", error);
    }
  }, []);
  
  useEffect(() => {
    if (showLocation) {
      fetchSavedLocation();
    }
  }, [showLocation, fetchSavedLocation]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome back, {user.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            This is your secure dashboard
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Authentication Status
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                Active
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Login Provider
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600 capitalize">
                {user.provider}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Member Since
              </dt>
              <dd className="mt-1 text-xl font-semibold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </div>
        </div>
        
        {/* Location Tracker Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setShowLocation(!showLocation);
              if (!showLocation) {
                getCurrentLocation();
              }
            }}
            className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            {showLocation ? "Hide My Location" : "Track My Live Location"}
          </button>
        </div>
        
        {/* Location Display */}
        {showLocation && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Location</h3>
              
              {locationStatus === "loading" && (
                <div className="text-center py-4">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  <p className="mt-2 text-gray-600">Fetching your location...</p>
                </div>
              )}
              
              {locationStatus === "success" && location && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-green-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Current Location</p>
                      <p className="text-sm text-gray-600">
                        Latitude: {location.lat} | Longitude: {location.lng}
                      </p>
                      {location.address && (
                        <p className="text-sm text-gray-600 mt-1">
                          📍 {location.address}
                        </p>
                      )}
                      {location.city && location.country && (
                        <p className="text-sm text-gray-600">
                          📍 {location.city}, {location.country}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Last updated: {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Map View */}
                  <div className="mt-4 h-64 rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.01},${location.lat-0.01},${location.lng+0.01},${location.lat+0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
                      title="Location Map"
                    />
                  </div>
                  
                  <button
                    onClick={getCurrentLocation}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Refresh Location
                  </button>
                </div>
              )}
              
              {locationStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-red-800">Unable to get location</p>
                      <p className="text-sm text-red-600">{locationError}</p>
                      <button
                        onClick={getCurrentLocation}
                        className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* User Info Card */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {user.picture && (
                <img src={user.picture} alt={user.username} className="w-12 h-12 rounded-full" />
              )}
              <div>
                <p className="font-medium text-gray-900">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600">
                <strong>User ID:</strong> {user.userId}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Provider:</strong> {user.provider}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}