import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Upload, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_AVATARS = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
];

const UploadProfile = () => {
  const { token, user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setFile(null);
    setPreview(null);
  };

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      setSelectedAvatar(null);
      setPreview(URL.createObjectURL(uploaded));
    }
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);
    
    // Check if token exists
    if (!token) {
      setError("You must be logged in to upload a profile picture.");
      setLoading(false);
      return;
    }

    try {
      if (file) {
        // User uploaded a custom image
        const formData = new FormData();
        formData.append("file", file);
        
        console.log("Uploading with token:", token?.substring(0, 20) + "...");

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/profile/upload/profile-pic`, 
          formData, 
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Upload response:", response.data);

      } else if (selectedAvatar) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/profile/upload/profile-pic/set-default`,
          { profilePicture: selectedAvatar },
          { 
            withCredentials: true, 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            } 
          }
        );
      } else {
        setLoading(false);
        return setError("Please select or upload an avatar.");
      }

      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update profile picture.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-6 space-y-6 text-center">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Select your avatar
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose one of the default avatars or upload your own.
        </p>

        {success ? (
          <div className="flex flex-col items-center text-green-500">
            <CheckCircle size={60} />
            <p className="mt-3 font-semibold">Avatar saved successfully!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center mt-4">
              {DEFAULT_AVATARS.map((avatar, idx) => (
                <div
                  key={idx}
                  className={`relative w-20 h-20 rounded-full overflow-hidden border-4 cursor-pointer transition-all duration-200 ${
                    selectedAvatar === avatar
                      ? "border-primary-500 shadow-lg scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${idx + 1}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ))}

              {/* Upload custom avatar */}
              <label className="relative w-20 h-20 rounded-full border-4 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <Upload size={26} className="text-gray-500 dark:text-gray-300" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm mt-3">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading || !token}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full font-semibold shadow-lg transition disabled:opacity-50 "
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </>
        )}
<button
  onClick={() => navigate("/")}
 
  className="mt-5 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 
             hover:from-emerald-600 hover:to-teal-700 
             text-white rounded-full font-semibold shadow-lg shadow-emerald-500/30 
             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
>
  Skip
</button>

      </div>
    
    </div>
    
  );
};

export default UploadProfile;