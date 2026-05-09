import { AlertTriangle, X, CheckCircle, Info, AlertOctagon } from 'lucide-react';
import { useState } from 'react';

const ICONS = {
  error: AlertOctagon,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

export default function AlertBanner({ type = 'info', message, onClose, persistent = false }) {
  const [visible, setVisible] = useState(true);
  const Icon = ICONS[type] || Info;

  if (!visible || !message) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div className={`alert-banner alert-${type}`}>
      <Icon size={20} />
      <span>{message}</span>
      {!persistent && (
        <button className="alert-close" onClick={handleClose}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
