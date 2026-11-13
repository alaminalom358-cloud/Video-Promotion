import React from 'react';
import { CampaignStatus } from '../../types';

interface StatusBadgeProps {
  status: CampaignStatus | 'verified' | 'suspended' | 'active' | 'completed' | 'in_review' | 'failed' | 'credited' | 'debited' | 'processing' | 'paid' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'verified':
      case 'completed':
      case 'credited':
      case 'paid':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'pending':
      case 'in_review':
      case 'processing':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'paused':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'rejected':
      case 'suspended':
      case 'failed':
      case 'debited':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'expired':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'active': return 'Active';
      case 'approved': return 'Approved';
      case 'paused': return 'Paused';
      case 'verified': return 'Verified';
      case 'completed': return 'Completed';
      case 'credited': return 'Credited';
      case 'pending': return 'Pending Review';
      case 'processing': return 'Processing';
      case 'in_review': return 'In Review';
      case 'rejected': return 'Rejected';
      case 'suspended': return 'Suspended';
      case 'failed': return 'Failed';
      case 'debited': return 'Debited';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded ${getStyle()}`}>
      {getLabel()}
    </span>
  );
};
