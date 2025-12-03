import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function GoogleLogin({ isDark }) {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: isDark ? "dark" : "light",
          size: "large",
          width: 320,
          text: "continue_with",
        });
      }
    };

    return () => {
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
      const result = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
          credentials: "include",
        }
      );

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

      if (data.success) {
        // Store token and user data
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login successful!");
        
        // Redirect to dashboard/chat page
        setTimeout(() => {
          navigate("/chat");
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