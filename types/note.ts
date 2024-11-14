export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  lastSaved: number | null;
}
