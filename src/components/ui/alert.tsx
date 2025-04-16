import React from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  type: AlertType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

const getAlertStyles = (type: AlertType) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200 text-green-700";
    case "error":
      return "bg-red-50 border-red-200 text-red-700";
    case "warning":
      return "bg-yellow-50 border-yellow-200 text-yellow-700";
    case "info":
    default:
      return "bg-blue-50 border-blue-200 text-blue-700";
  }
};

const getIcon = (type: AlertType) => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "warning":
    case "info":
    default:
      return <AlertCircle className="h-5 w-5 text-blue-500" />;
  }
};

export const Alert = ({
  type,
  title,
  message,
  onClose,
  className = "",
}: AlertProps) => {
  return (
    <div
      className={`rounded-md border p-4 mb-4 ${getAlertStyles(
        type
      )} ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon(type)}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {message && <div className="mt-1 text-sm">{message}</div>}
        </div>
        {onClose && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-transparent p-1.5 hover:bg-opacity-10 hover:bg-gray-500 rounded-md"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
