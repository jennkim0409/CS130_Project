import { toast } from 'react-toastify';

// function to navigate user back to sign up page
function expiredToken() {
  // Show a toast notification
  toast.error("Your token expired! Please sign in again.", {
    position: "top-center",
    autoClose: 3000, // Auto close after 5 seconds
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    onClose: () => {
    // This function is called after the toast is dismissed
      // Remove the token from localStorage
      localStorage.removeItem("user_token");
      
      // Redirect to the login page after the toast notification closes
      window.location.href = '/';
    }
  });
}

export default expiredToken;
