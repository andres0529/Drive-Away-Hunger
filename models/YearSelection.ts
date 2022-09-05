//Year Selection type
export interface IYearSelection {
  Year: string;
}

export type YearSelectionContextType = {
  YearSelection: IYearSelection;
  setYear: (Year: IYearSelection) => void;
};
