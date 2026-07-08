import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { API_BASE_URL } from "../constants/apiConfig";

export default function GoogleLogin({ isDark }) {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const wrapperRef = useRef(null);
  const { setUserData } = useContext(AppContext);
  const [buttonWidth, setButtonWidth] = useState(280);

  const handleCredentialResponse = useCallback(async (response) => {
    try {
      if (!response.credential) {
        toast.error("No credential received from Google");
        return;
      }

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
        setUserData(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login successful!");

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
  }, [navigate, setUserData]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const updateButtonWidth = () => {
      if (!wrapperRef.current) return;
      const containerWidth = wrapperRef.current.getBoundingClientRect().width;
      const nextWidth = Math.max(220, Math.min(400, Math.floor(containerWidth - 8)));
      setButtonWidth(nextWidth);
    };

    updateButtonWidth();
    window.addEventListener("resize", updateButtonWidth);
    
    // Don't initialize Google Sign-In if client ID is missing
    if (!clientId) {
      console.warn("Google Client ID is not configured. Google Sign-In will not be available.");
      return;
    }

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
            width: buttonWidth,
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
      window.removeEventListener("resize", updateButtonWidth);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [buttonWidth, handleCredentialResponse, isDark]);

  return (
    <div
      ref={wrapperRef}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "44px",
      }}
    >
      <div
        ref={googleButtonRef}
        style={{
          width: "100%",
          maxWidth: "360px",
          minHeight: "44px",
          display: "flex",
          justifyContent: "center",
        }}
      />
    </div>
  );
}