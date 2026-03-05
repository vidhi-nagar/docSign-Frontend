import React, { useRef, useState, useEffect } from "react";
import {
  useLocation,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { Document, Page, pdfjs } from "react-pdf";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";
import { PDFDocument } from "pdf-lib";
import { axiosInstance } from "../context/axios";
import { useAuth } from "../context/authContext";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const Editor = ({ externalFileUrl, externalDocId, isExternal }) => {
  const navigate = useNavigate();
  // const { id } = useParams(); // URL se dynamic ID access kar rahe hain
  const { id: urlId } = useParams();
  const location = useLocation();
  const fileUrl = isExternal
    ? externalFileUrl
    : location.state?.fileUrl || null;
  const { user } = useAuth();
  console.log(location);

  const draggableNodeRef = useRef(null);
  const sigCanvas = useRef(null);
  const [isFinished, setIsFinished] = useState(false);
  const [sign, setSign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numPages, setNumPages] = useState(0);

  const [sigData, setSigData] = useState({
    pageIndex: null,
    x: 50,
    y: 50,
    width: 150,
    height: 70,
  });

  if (!fileUrl) {
    console.log("Note: fileUrl is not available yet", fileUrl);
  }

  //  useEffect for Debugging
  useEffect(() => {
    if (!user) {
      toast.error("Please login first to upload and sign documents!");
      navigate("/register");
    }

    console.log("Editor Mounted. File ID (from URL):", urlId);
    if (!fileUrl) {
      console.log("Note: fileUrl is not available yet");
    } else {
      console.log("Editor Mounted , fileUrl:", fileUrl);
    }
  }, [urlId, fileUrl, user, navigate]);

  const handleSaveSignature = () => {
    if (sigCanvas.current.isEmpty()) return alert("Pehle sign kijiye!");
    const dataUrl = sigCanvas.current.getSignaturePad().toDataURL("image/png");
    setSign(dataUrl);
    setIsModalOpen(false);
    setSigData((prev) => ({ ...prev, pageIndex: null }));
  };

  const generateSignedPDF = async () => {
    try {
      if (!fileUrl) {
        alert("Error: PDF file URL gayab hai. Dashboard se wapas aaiye.");
        return null;
      }
      if (!sign) {
        alert("Pehle signature create kijiye!");
        return null;
      }

      const existingPdfBytes = await fetch(fileUrl).then((res) =>
        res.arrayBuffer(),
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const targetPage = pages[sigData.pageIndex];
      const { width: pageWidth, height: pageHeight } = targetPage.getSize();

      const signatureImage = await pdfDoc.embedPng(sign);

      const canvasContainers = document.querySelectorAll(".pdf-page-container");
      const currentCanvas =
        canvasContainers[sigData.pageIndex].querySelector("canvas");

      if (!currentCanvas) throw new Error("PDF Canvas found nahi hua!");

      const canvasWidth = currentCanvas.clientWidth;
      const canvasHeight = currentCanvas.clientHeight;

      const scaleX = pageWidth / canvasWidth;
      const scaleY = pageHeight / canvasHeight;

      const finalX = sigData.x * scaleX;
      const finalY = pageHeight - sigData.y * scaleY - sigData.height * scaleY;

      targetPage.drawImage(signatureImage, {
        x: finalX,
        y: finalY,
        width: sigData.width * scaleX,
        height: sigData.height * scaleY,
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Signed_Doc_${Date.now()}.pdf`;
      document.body.appendChild(link); // Zaroori fix for some browsers
      link.click();
      document.body.removeChild(link);
      return pdfBytes;
    } catch (err) {
      console.error("PDF Logic Error:", err);
      alert("PDF download failed: " + err.message);
      return pdfBytes;
    }
  };

  const handleFinish = async () => {
    const currentFileId = isExternal ? externalDocId : urlId;
    const currentSignerId = isExternal
      ? "EXTERNAL_USER"
      : user?._id || user?.id;

    // Validation
    if (!currentFileId || currentFileId === "undefined") {
      return alert("Error: File ID missing hai!");
    }
    if (!sign || sigData.pageIndex === null) {
      return alert("Pehle signature ko PDF par set karein!");
    }

    try {
      // 1. PDF Bytes generate karo (Jo aapne pehle function banaya tha use call kar rahe hain)
      // NOTE: generateSignedPDF niche diye gaye tarike se update hona chahiye
      const pdfBytes = await generateSignedPDF();
      if (!pdfBytes) return;

      // 2. PDF Bytes ko upload-able File mein convert karo
      const signedBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const signedFile = new File([signedBlob], `Signed_${Date.now()}.pdf`, {
        type: "application/pdf",
      });

      // 3. FormData taiyar karein (Cloudinary/Multer ke liye)
      const formData = new FormData();
      formData.append("documentId", String(currentFileId).trim());
      formData.append("signerId", currentSignerId);
      formData.append("x", Math.round(sigData.x));
      formData.append("y", Math.round(sigData.y));
      formData.append("pdf", signedFile); // Backend isi 'pdf' key ko read karega

      console.log("documnetID", currentFileId);

      console.log("Uploading Signed PDF to Cloudinary...");

      // 4. Backend Request
      const response = await axiosInstance.post(
        "/api/signature-save",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // token: localStorage.getItem("token"),
          },
        },
      );

      if (response.data.success) {
        // alert("Mubarak ho! Signed PDF Cloudinary par save ho gayi.");
        setIsFinished(true);
        // navigate("/dashboard");
        // navigate(isExternal ? "/thank-you" : "/dashboard");
        if (!isExternal) {
          setTimeout(() => navigate("/dashboard"), 3000);
        }
      }
    } catch (error) {
      console.error("Save Error:", error.response?.data || error.message);
      alert(
        "Error: " + (error.response?.data?.message || "Upload fail ho gaya"),
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r flex flex-col p-5 shadow-lg z-20">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Editor Tools</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold mb-8 hover:bg-blue-700 transition shadow-md"
        >
          🖋️ New Signature
        </button>
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 mb-4 uppercase">
            Saved Signature
          </p>
          {sign ? (
            <div
              className="border-2 border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/50 cursor-pointer"
              onClick={() =>
                setSigData({ ...sigData, pageIndex: 0, x: 50, y: 50 })
              }
            >
              <img src={sign} alt="Sign" className="w-full h-auto" />
              <p className="text-[10px] text-center text-blue-500 font-bold mt-2">
                Click to place on Page 1
              </p>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 italic text-sm">
              No signature
            </div>
          )}
        </div>
        <button
          onClick={handleFinish}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
        >
          Finish & Save ✅
        </button>
      </div>

      {/* MAIN PDF AREA */}
      <div className="flex-1 overflow-y-auto bg-gray-200 p-8 relative">
        <div className="max-w-4xl mx-auto">
          {fileUrl && (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className="flex flex-col items-center"
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`page_${index}`}
                  className="pdf-page-container relative mb-10 bg-white shadow-2xl"
                >
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />

                  {/* FIXED DRAGGABLE WITH nodeRef */}
                  {sign && sigData.pageIndex === index && (
                    <Draggable
                      nodeRef={draggableNodeRef}
                      bounds="parent"
                      onStop={(e, data) =>
                        setSigData({
                          ...sigData,
                          x: data.x,
                          y: data.y,
                          pageIndex: index,
                        })
                      }
                      position={{ x: sigData.x, y: sigData.y }}
                    >
                      <div
                        ref={draggableNodeRef}
                        className="absolute top-0 left-0 z-50 group"
                      >
                        <Resizable
                          size={{
                            width: sigData.width,
                            height: sigData.height,
                          }}
                          onResizeStop={(e, direction, ref, d) => {
                            setSigData((prev) => ({
                              ...prev,
                              width: prev.width + d.width,
                              height: prev.height + d.height,
                            }));
                          }}
                          handleComponent={{
                            bottomRight: (
                              <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full absolute -right-1 -bottom-1 cursor-se-resize shadow-md" />
                            ),
                          }}
                        >
                          <div className="w-full h-full border-2 border-blue-500 border-dashed bg-blue-400/10 relative">
                            <img
                              src={sign}
                              className="w-full h-full object-contain pointer-events-none"
                            />
                            <button
                              onClick={() =>
                                setSigData({ ...sigData, pageIndex: null })
                              }
                              className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center shadow-lg border-2 border-white"
                            >
                              ✕
                            </button>
                          </div>
                        </Resizable>
                      </div>
                    </Draggable>
                  )}

                  {/* Drop zone indicator */}
                  {sign && sigData.pageIndex !== index && (
                    <div
                      className="absolute inset-0 hover:bg-blue-500/5 cursor-pointer flex items-center justify-center border-2 border-transparent hover:border-blue-300 transition"
                      onClick={() =>
                        setSigData({
                          ...sigData,
                          pageIndex: index,
                          x: 50,
                          y: 50,
                        })
                      }
                    >
                      <span className="opacity-0 hover:opacity-100 text-blue-500 font-bold bg-white px-3 py-1 rounded-full shadow-md text-sm">
                        Place Sign Here
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </Document>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-100">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              Draw Signature
            </h3>
            <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl overflow-hidden mb-6">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: 450,
                  height: 220,
                  className: "w-full cursor-crosshair",
                }}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => sigCanvas.current.clear()}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600"
              >
                Clear
              </button>
              <button
                onClick={handleSaveSignature}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100"
              >
                Save to Sidebar
              </button>
            </div>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="fixed inset-0 bg-white z-200 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-green-100 p-6 rounded-full mb-6 animate-bounce">
            <CheckCircle size={80} className="text-green-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-gray-600 max-w-md">
            Aapka document successfully sign ho gaya hai aur humne copy save kar
            li hai.
          </p>
          <p className="mt-8 text-sm text-gray-400">
            Ab aap is window ko band kar sakte hain.
          </p>

          {!isExternal && (
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      )}
    </div>
  );
};
