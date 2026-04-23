"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function AuthPage() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="p-6">
          <h1 className="text-2xl font-bold">
            Welcome {user?.username}
          </h1>

          <button
            onClick={signOut}
            className="mt-4 bg-black text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      )}
    </Authenticator>
  );
}