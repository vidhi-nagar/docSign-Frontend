import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../context/axios";
import { Editor } from "./Editor"; // Hum purane editor ko hi reuse karenge

const ExternalSignEditor = () => {
  const { token } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        // Bina login wala route call hoga
        const res = await axiosInstance.get(`/api/public/${token}`);
        if (res.data.success) {
          setFileData(res.data.data);
        }
      } catch (err) {
        alert("Link invalid hai ya expire ho gaya hai.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [token]);

  if (loading)
    return <div className="p-10 text-center">Loading Document...</div>;
  if (!fileData)
    return (
      <div className="p-10 text-center text-red-500">Document nahi mila!</div>
    );

  // Purane Editor ko props bhej kar reuse kar rahe hain
  // Taki dobara mehnat na karni pade
  return (
    <div className="external-wrapper">
      <div className="bg-blue-600 text-white p-2 text-center text-sm">
        Public Signing Mode: Please sign the document below.
      </div>
      <Editor
        externalFileUrl={fileData.filePath}
        externalDocId={fileData._id}
        isExternal={true}
      />
    </div>
  );
};

export default ExternalSignEditor;
