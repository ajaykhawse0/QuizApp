import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { User, Mail, Shield, Loader2, Camera } from "lucide-react";

const ProfilePage = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader2 className="animate-spin text-primary-600 dark:text-primary-400" size={42} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-10">
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-8 space-y-6 text-center">
        {/* Profile Picture Section */}
        <div className="relative flex flex-col items-center space-y-3">
          <div className="relative">
            <img
              src={profile?.profilePicture || "/avatars/avatar3.png"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-primary-500 shadow-md"
            />

            {/* Camera Icon Overlay - Positioned on the image */}
            <button
              onClick={() => navigate("/upload-profile")}
              className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-full shadow-lg transition transform hover:scale-110"
              title="Change profile picture"
            >
              <Camera size={18} />
            </button>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {profile?.name || "User"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {profile?.role === "superadmin"
              ? "Super Admin"
              : profile?.role === "admin"
              ? "Admin"
              : "User"}
          </p>
        </div>

        {/* User Info Section */}
        <div className="text-left space-y-4 mt-6">
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <Mail size={18} className="text-primary-500" />
            <span>{profile?.email}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <Shield size={18} className="text-primary-500" />
            <span className="capitalize">{profile?.role}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <User size={18} className="text-primary-500" />
            <span>
              Joined on{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-GB")
                : "Unknown"}
            </span>
          </div>
        </div>

        <button
          onClick={() => alert("Edit feature coming soon!")}
          className="mt-6 w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full font-semibold shadow-lg transition"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;