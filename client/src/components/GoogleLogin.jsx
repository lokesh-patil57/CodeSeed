import { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

// Prefer VITE_API_URL (for deployed backend), then VITE_BACKEND_URL, then localhost
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000";

export default function GoogleLogin({ isDark }) {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const { setUserData } = useContext(AppContext);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // Don't initialize Google Sign-In if client ID is missing
    if (!clientId) {
      console.warn("Google Client ID is not configured. Google Sign-In will not be available.");
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      console.error("Failed to load Google Identity Services script");
    };

    document.head.appendChild(script);

    // Error filtering is now handled globally in errorFilter.js
    // No need to override console.error here anymore

    script.onload = () => {
      if (window.google && googleButtonRef.current && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          });

          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: isDark ? "dark" : "light",
            size: "large",
            width: 600,
            text: "continue_with",
          });
        } catch (error) {
          // Suppress Google OAuth configuration errors (403 origin not allowed)
          // These are configuration issues, not code errors
          if (!error.message?.includes('origin') && !error.message?.includes('client ID')) {
            console.error("Error initializing Google Sign-In:", error);
          }
          // Show user-friendly message if initialization fails
          if (googleButtonRef.current) {
            googleButtonRef.current.innerHTML = `
              <div style="padding: 10px; text-align: center; color: ${isDark ? '#fff' : '#000'};">
                Google Sign-In unavailable. Please check your configuration.
              </div>
            `;
          }
        }
      }
    };

    return () => {
      // Cleanup: remove script if component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [isDark]);

  const handleCredentialResponse = async (response) => {
    try {
      if (!response.credential) {
        toast.error("No credential received from Google");
        return;
      }

      // Send token to backend
      const result = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
        credentials: "include",
      });

      const data = await result.json().catch(() => ({}));

      if (!result.ok || !data.success) {
        const message =
          data.message ||
          (result.status === 403
            ? "Google login is not allowed for this origin. Check OAuth settings."
            : "Google authentication failed.");
        toast.error(message);
        return;
      }

      if (data.success && data.user) {
        // Update context with user data
        setUserData(data.user);
        
        // Save user data to localStorage for Chat component
        localStorage.setItem("user", JSON.stringify(data.user));
        
        toast.success("Login successful!");
        
        // Redirect to dashboard/chat page
        setTimeout(() => {
          navigate("/chat", { replace: true });
        }, 500);
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(
        error.message || "Unable to contact the server for Google login."
      );
    }
  };

  return (
    <div
      ref={googleButtonRef}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "44px",
      }}
    />
  );
}