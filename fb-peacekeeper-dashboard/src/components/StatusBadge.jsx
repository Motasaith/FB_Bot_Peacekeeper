import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

const StatusBadge = ({ status, sentiment }) => {
  const getStyles = () => {
    if (status === 'pending_approval') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'approved') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'rejected') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getIcon = () => {
    if (status === 'pending_approval') return <Clock size={14} />;
    if (status === 'approved') return <CheckCircle size={14} />;
    return <AlertCircle size={14} />;
  };

  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
      getStyles()
    )}>
      {getIcon()}
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </span>
  );
};

export default StatusBadge;
