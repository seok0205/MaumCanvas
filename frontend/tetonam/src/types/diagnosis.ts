export interface DiagnosisCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
}

export interface DiagnosisCardProps {
  category: DiagnosisCategory;
  onStartDiagnosis: (categoryId: string) => void;
}

export interface DisclaimerBoxProps {
  className?: string;
}

export interface DiagnosisGridProps {
  categories: DiagnosisCategory[];
  onStartDiagnosis: (categoryId: string) => void;
}

export type DiagnosisType =
  | 'ptsd'
  | 'depression'
  | 'anxiety'
  | 'suicide-risk'
  | 'drawing';
