// components/subjectteacher/MarksTab.tsx
import React from "react";
import { MarksEntry } from "../shared/MarksEntry";
import { MarksTabProps } from "./types";

export const MarksTab: React.FC<MarksTabProps> = ({ 
  onConfigUpdate, 
  onRemoveCat, 
  onSaveMarks, 
  onImportMarks,
  pagination,
  ...props 
}) => {
  return (
    <MarksEntry 
      {...props} 
      onConfigUpdate={onConfigUpdate}
      onRemoveCat={onRemoveCat}
      onSaveMarks={onSaveMarks}
      onImportMarks={onImportMarks}
      pagination={pagination}
      mode="subject"
    />
  );
};
