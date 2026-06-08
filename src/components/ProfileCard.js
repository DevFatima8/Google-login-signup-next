"use client";

import Image from "next/image";

export default function ProfileCard({ user }) {
  if (!user) return null;
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex items-center space-x-4">
        {user.picture && (
          <Image
            src={user.picture}
            alt={user.username}
            width={80}
            height={80}
            className="rounded-full"
          />
        )}
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {user.username}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {user.email}
          </p>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.userId}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Provider</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{user.provider}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}