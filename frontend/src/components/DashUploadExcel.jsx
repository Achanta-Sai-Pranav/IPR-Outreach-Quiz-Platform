import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import axios from "../axiosConfig.jsx";

const checkImageLink = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

const ImageWithFallback = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    const validateImage = async () => {
      const isValid = await checkImageLink(src);
      if (!isValid) {
        setImgSrc(null);
      }
    };
    validateImage();
  }, [src]);

  return (
    <div className="w-10 h-10 flex items-center justify-center mx-auto">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          {...props}
          className="w-full h-full object-cover"
        />
      ) : null}
    </div>
  );
};

function DashUploadExcel() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadProgress(0);
      setMessage("");
      previewExcel(selectedFile);
    }
  };

  const previewExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 16);
      setFilePreview(rows);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))
    ) {
      setFile(droppedFile);
      setUploadProgress(0);
      setMessage("");
      previewExcel(droppedFile);
    } else {
      setMessage("Please drop a valid Excel file (.xlsx or .xls)");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "questions/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      setMessage("File uploaded successfully");
      toast.success("File uploaded successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error uploading file";
      setMessage(errorMessage);
      toast.error(errorMessage);
      console.error("Upload error:", error.response?.data);
    }
  };

  const handleDeleteAllQuestions = async () => {
    setIsDeleting(true);
    try {
      await axios.delete("/api/questions/delete-all");
      toast.success(
        "All questions and related quiz questions have been deleted successfully"
      );
      setShowDeleteConfirmation(false);
      // Reset file and preview states
      setFile(null);
      setFilePreview([]);
      setUploadProgress(0);
      setMessage("");
    } catch (error) {
      toast.error(
        "Error deleting questions: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-[calc(88vh)] items-center bg-white p-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-[98rem] min-h-[80vh] w-full border-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-4xl font-semibold text-blue-600">
            Upload Excel file
          </h2>
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete All Questions"}
          </button>
        </div>
        <div
          className={`border-2 border-dashed ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } rounded-lg flex flex-col gap-2 p-6 items-center cursor-pointer mb-6`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <FileIcon className="w-12 h-12 text-blue-500" />
          <span className="text-sm font-medium text-gray-600 text-center">
            {file ? file.name : "Drag and drop a file or click to browse"}
          </span>
          <span className="text-xs text-gray-500">
            Excel files (.xlsx, .xls)
          </span>
        </div>
        {file && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected file: {file.name}
            </p>
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
            ref={fileInputRef}
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white text-lg font-bold transition-all hover:bg-blue-700 active:scale-[.98]"
          >
            Upload
          </button>
        </form>
        {message && (
          <p className="text-center text-green-500 mb-6">{message}</p>
        )}
        {filePreview.length > 0 && (
          <div>
            <h3 className="text-3xl font-semibold mb-4 text-blue-600">
              File Preview
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-2">
                <thead>
                  <tr className="bg-blue-100">
                    {filePreview[0].map((col, index) => (
                      <th
                        key={index}
                        className="border-b border-blue-200 px-2 py-2 text-sm font-semibold text-blue-800"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filePreview.slice(1, 16).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={
                        rowIndex % 2 === 0
                          ? "bg-gray-50 text-center"
                          : "bg-white text-center"
                      }
                    >
                      {row.map((cell, cellIndex) => {
                        const isLinkColumn = filePreview[0][cellIndex]
                          .toLowerCase()
                          .includes("link");
                        return (
                          <td
                            key={cellIndex}
                            className="border-b border-gray-200 px-2 py-2 text-sm text-gray-700"
                          >
                            {isLinkColumn ? (
                              cell ? (
                                <ImageWithFallback
                                  src={cell}
                                  alt="Preview"
                                  className="w-10 h-10 object-cover cursor-pointer"
                                  onClick={() => setSelectedImage(cell)}
                                />
                              ) : null
                            ) : (
                              cell
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filePreview.length > 16 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Showing first 15 rows out of {filePreview.length - 1} total
                rows.
              </p>
            )}
          </div>
        )}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              <p className="mb-4">
                Are you sure you want to delete all questions and related quiz
                questions? This action cannot be undone.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg mr-2 hover:bg-gray-400 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllQuestions}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete All"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full"
          />
        </div>
      )}
    </div>
  );
}

function FileIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

export default DashUploadExcel;
