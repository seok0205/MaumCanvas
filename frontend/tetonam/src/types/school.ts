export interface School {
  name: string;
}

export interface SchoolSearchResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: School[];
}

export interface SchoolSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (school: School) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface SchoolSearchResultsProps {
  schools: School[];
  onSelect: (school: School) => void;
  query: string;
  isLoading?: boolean;
  className?: string;
}
