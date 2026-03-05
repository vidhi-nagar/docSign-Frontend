import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/authContext.jsx"; // User ka data lene ke liye
import { LogOut, FileText, Upload } from "lucide-react"; // Icons
import { axiosInstance } from "../context/axios";
import { Document, Page, pdfjs } from "react-pdf";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// import { url } from "zod";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const UploadPdf = () => {
  const { user, setUser } = useAuth(); // Context se user nikalna
  const fileInputef = useRef(null);
  const [file, setFile] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  // const [actualPath, setActualPath] = useState(null);

  const navigate = useNavigate();

  const handleIconClick = () => {
    fileInputef.current.click();
  };

  // Dashboard.jsx (Selected Changes)
  const handleUpload = async (e) => {
    e.preventDefault();

    // if (!user) {
    //   toast.error("Please login first to upload and sign documents!");
    //   navigate("/register"); // Ya jo bhi aapka login route hai
    //   return;
    // }

    if (!file) return alert("Pehle file select karo!");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axiosInstance.post("/api/docs/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        // Backend se document ki ID aur Path dono nikaalein
        const docData = response.data.data;
        const uploadedFileId = docData?._id || response.data?._id;
        const actualPath = response.data.filePath || docData?.filePath;

        console.log("FINAL CHECK -> ID:", uploadedFileId, "URL:", actualPath);

        if (!uploadedFileId) {
          alert("Server error: Database ID nahi mili!");
          return;
        }

        console.log("Full Backend Response:", response.data);
        // console.log("Navigate With:", {
        //   id: uploadedFileId,
        //   url: actualPath,
        // });

        // ID ko URL parameter mein bhejein
        navigate(`/editor/${uploadedFileId}`, {
          state: { fileUrl: actualPath },
        });
      }
    } catch (error) {
      console.error("Upload fail:", error);
    }
  };
  // const handleUpload = async (e) => {
  //   e.preventDefault();
  //   // if (!file) return alert("Pehle file select karo!");

  //   const formData = new FormData();
  //   formData.append("pdf", file);
  //   // formData.append("title", title);

  //   try {
  //     const response = await axiosInstance.post("/api/docs/upload", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     if (response.data.success) {
  //       console.log("Backend Response:", response.data);

  //       const actualPath = response.data.filePath;

  //       if (actualPath) {
  //         setPreviewUrl(actualPath);
  //         console.log("Found Path :", actualPath);

  //         navigate("/editor", { state: { fileUrl: actualPath } });
  //       } else {
  //         console.log(
  //           "URL nahi mila, backend response check karein:",
  //           response.data,
  //         );
  //       }
  //       setFile(null);
  //       // alert("File Upload Ho Gayi! 🎉");
  //     }
  //   } catch (error) {
  //     console.log("--- DEBUG ERROR START ---");
  //     console.log("Message:", error.response?.data?.message);
  //     console.log("Full Data:", error.response?.data);
  //     console.log("--- DEBUG ERROR END ---");
  //     console.error("Upload fail:", error);
  //   }
  // };

  const handleLogout = () => {
    // Logout logic: User state khali karo aur cookies backend se delete hongi
    setUser(null);
    window.location.href = "/auth"; // Refresh karke login par bhejo
  };

  const onhandleEdit = () => {
    // window.open(pdfUrl, "_blank", "/editor");
    navigate("/editor", { state: { fileUrl: actualPath } });
  };

  useEffect(() => {
    if (!user) {
      toast.error("Please login first to upload and sign documents!");
      navigate("/register");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">DocSign Pro</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            Welcome, <b>{user?.name}</b>
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <form onSubmit={handleUpload} className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center border-2 border-dashed border-gray-200">
          <div
            onClick={handleIconClick}
            className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Upload className="text-blue-600" />
            <input
              type="file"
              ref={fileInputef}
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Upload your PDF</h2>
          <p className="text-gray-500 mb-6">
            {file
              ? `Selected: ${file.name}`
              : "Apna document upload karein aur signature add karein."}
          </p>

          <button
            onClick={file ? handleUpload : handleIconClick}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            {file ? "Upload Now" : "Select File"}
          </button>
        </div>
      </form>

      {previewUrl && (
        <div className=" w-1/4 mt-8 p-4 bg-white border rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4">Document Preview</h3>

          <div className="flex justify-center border p-2 bg-gray-100 rounded-lg overflow-hidden">
            <Document
              file={previewUrl}
              // onLoadSuccess={() => console.log("PDF Loaded!")}
              // onLoadError={(error) =>
              //   console.log("PDF Load Error Details:", error)
              // }
            >
              <Page
                pageNumber={1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                scale={0.8}
              />
            </Document>
          </div>

          <button
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg "
            // onClick={}
          >
            Go to Sign Editor
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPdf;
