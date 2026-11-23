import React from 'react';
import Button from '@/components/common/Button';
import { Download, FileText, Printer } from 'lucide-react';

export default function ExportButtons({ onExportCsv, loading = false, disabled = false, className }) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<Download size={13} />}
        onClick={onExportCsv}
        loading={loading}
        disabled={disabled}
      >
        Export CSV
      </Button>
    </div>
  );
}

