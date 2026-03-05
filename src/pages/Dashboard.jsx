import React, { useEffect, useState } from "react";
import { axiosInstance } from "../context/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, Mail, Loader2 } from "lucide-react";
import { useAuth } from "../context/authContext.jsx";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [userDocs, setUserDocs] = useState([]); // State for documents
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // if (!user) {
  //   toast.error("Please login first to upload and sign documents!");
  //   navigate("/register");
  // }

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/docs/all`);
      if (res.data.success) {
        setUserDocs(res.data.data);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (email, documentId) => {
    if (!email) return alert("Please enter an email!");
    try {
      setSendingEmail(true);
      const response = await axiosInstance.post("api/docs/send-email-invite", {
        recipientEmail: email,
        documentId,
      });

      if (response.data.success) {
        alert("Invite link sent to " + email);
        setShowModal(false);
        setInviteEmail("");
      }
    } catch (error) {
      alert(
        "Error sending email: " +
          (error.response?.data?.message || "Server error"),
      );
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error("Please login first to upload and sign documents!");
      navigate("/register");
    }

    fetchDocs();
  }, [location.key, user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <CheckCircle className="text-green-600" /> Digital Sign Dashboard
          </h1>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Total Docs: {userDocs.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-gray-600">Document Name</th>
                  <th className="p-4 text-gray-600">Date</th>
                  <th className="p-4 text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userDocs.length > 0 ? (
                  userDocs.map((doc, index) => (
                    <tr
                      key={doc._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-4 font-medium text-gray-800">
                        {doc.originalName || `Document ${index + 1}`}
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 flex justify-end gap-3">
                        {/* Invite Button */}
                        <button
                          onClick={() => {
                            setSelectedDocId(doc._id);
                            setShowModal(true);
                          }}
                          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
                        >
                          <Mail size={16} /> Invite
                        </button>

                        {/* Download Button (Only if signed) */}
                        {doc.signFilePath && (
                          <a
                            href={doc.signFilePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
                          >
                            <Download size={16} /> Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-10 text-center text-gray-400">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Invite Signer
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Signer will receive a unique link via email to sign this PDF.
            </p>

            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Recipient Email
            </label>
            <input
              type="email"
              placeholder="signer@example.com"
              className="w-full border-2 border-gray-100 p-3 rounded-xl mb-6 focus:border-blue-500 outline-none transition"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => sendInvite(inviteEmail, selectedDocId)}
                disabled={sendingEmail}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg disabled:bg-blue-300"
              >
                {sendingEmail ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
